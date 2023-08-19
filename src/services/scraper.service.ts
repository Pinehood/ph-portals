import { randomUUID } from "crypto";
import * as cheerio from "cheerio";
import axios from "@/common/axios";
import {
  CheerioExtractor,
  getDefaultArticle,
  isValidArticle,
  ScraperConfig,
  shouldArticleBeDisplayed,
  TryCatch,
} from "@/common";
import { Article } from "@/dtos";

export class ScraperService {
  static async scrape(config: ScraperConfig): Promise<Article[]> {
    const articles: Article[] = [];
    await TryCatch(async () => {
      const defaultArticle = getDefaultArticle(
        config.type,
        config.link,
        config.name,
      );
      for (let i = 0; i < config.roots.length; i++) {
        const rootLink = config.roots[i];
        const articleLinks = config.links
          ? await config.links(rootLink)
          : config.rss
          ? await ScraperService.rssLinks(rootLink, config.link)
          : config.linker
          ? await ScraperService.nonRssLinks(
              rootLink,
              config.link,
              config.linker,
            )
          : await ScraperService.jsonLinks(rootLink, config.link);
        if (articleLinks && articleLinks.length > 0) {
          for (let i = 0; i < articleLinks.length; i++) {
            const articleLink = articleLinks[i];
            if (articles.findIndex((a) => a.articleLink == articleLink) > -1)
              continue;

            const article = await axios.get(articleLink);
            if (article && article.data) {
              await TryCatch(async () => {
                const articleHtml = article.data as string;
                const $ = cheerio.load(articleHtml);

                config.remove1.forEach((removal) => $(removal).remove());

                const articleId = config.id
                  ? config.id(articleLink)
                  : ScraperService.id(articleLink);

                const title = ScraperService.cheerioExtract($, config.title);
                const lead = ScraperService.cheerioExtract($, config.lead);
                const time = ScraperService.cheerioExtract($, config.time);
                const author = ScraperService.cheerioExtract($, config.author);

                if (config.remove2) {
                  config.remove2.forEach((removal) => $(removal).remove());
                }

                const content = $(config.content.find).html();

                const articleObj: Article = {
                  ...defaultArticle,
                  articleId,
                  articleLink,
                  author,
                  content,
                  lead,
                  time,
                  title,
                };
                ScraperService.replaceAndTransform(articleObj, config);
                articles.push(articleObj);
              });
            }
          }
        }
      }
    });
    return articles.filter(
      (a) => isValidArticle(a) && shouldArticleBeDisplayed(a),
    );
  }

  private static id(link: string): string {
    try {
      return link
        .substring(link.lastIndexOf("-") + 1)
        .replace("/", "")
        .replace(".html", "");
    } catch {
      return randomUUID();
    }
  }

  private static async rssLinks(link: string, base: string): Promise<string[]> {
    try {
      const rss = await axios.get(link);
      if (rss && rss.data) {
        return (rss.data as string)
          .match(/<link>(.*?)<\/link>/g)
          .map((link) => {
            let articleLink = link.replace("<link>", "").replace("</link>", "");
            if (!articleLink.startsWith("http")) {
              if (!articleLink.startsWith("/")) {
                articleLink = `${base}/${articleLink}`;
              } else {
                articleLink = `${base}${articleLink}`;
              }
            }
            return articleLink;
          })
          .filter((articleLink) => articleLink.includes("-"));
      }
    } catch {
      return [];
    }
  }

  private static async nonRssLinks(
    link: string,
    base: string,
    find: string,
  ): Promise<string[]> {
    try {
      const articleLinks: string[] = [];
      const articlesData = await axios.get(link);
      if (articlesData && articlesData.data) {
        const $ = cheerio.load(articlesData.data as string);
        $(find).each((_, el) => {
          let articleLink = $(el).attr("href");
          if (!articleLink.startsWith("http")) {
            if (!articleLink.startsWith("/")) {
              articleLink = `${base}/${articleLink}`;
            } else {
              articleLink = `${base}${articleLink}`;
            }
          }
          if (articleLinks.findIndex((el) => el == articleLink) == -1) {
            articleLinks.push(articleLink);
          }
        });
      }
      return articleLinks;
    } catch {
      return [];
    }
  }

  private static async jsonLinks(
    link: string,
    base: string,
  ): Promise<string[]> {
    try {
      const articleLinks: string[] = [];
      const list = await axios.get(link);
      const processLink = (articleLink: string) => {
        if (!articleLink.startsWith("http")) {
          if (!articleLink.startsWith("/")) {
            articleLink = `${base}/${articleLink}`;
          } else {
            articleLink = `${base}${articleLink}`;
          }
        }
        if (articleLinks.findIndex((el) => el == articleLink) == -1) {
          articleLinks.push(articleLink);
        }
      };
      if (list && list.data) {
        const obj = JSON.parse(list.data) as {
          posts: any[];
        };
        if (obj && obj.posts && obj.posts.length > 0) {
          for (let i = 0; i < obj.posts.length; i++) {
            const post = obj.posts[i];
            let articleLink = post.permalink;
            if (!articleLink) articleLink = post.link;
            processLink(articleLink);
          }
        } else {
          const arr = JSON.parse(list.data) as any[];
          if (arr && arr.length > 0) {
            for (let i = 0; i < arr.length; i++) {
              const post = arr[i];
              let articleLink = post.permalink;
              if (!articleLink) articleLink = post.link;
              processLink(articleLink);
            }
          }
        }
      }
      return articleLinks;
    } catch {
      return [];
    }
  }

  private static replaceAndTransform(
    article: Article,
    config: ScraperConfig,
  ): void {
    article.title = ScraperService.replaceAndTransformSingle(
      article.title,
      config.title,
    );
    article.lead = ScraperService.replaceAndTransformSingle(
      article.lead,
      config.lead,
    );
    article.time = ScraperService.replaceAndTransformSingle(
      article.time,
      config.time,
    );
    article.author = ScraperService.replaceAndTransformSingle(
      article.author,
      config.author,
    );
    if (article.content) {
      article.content = article.content.replace(/\n/g, "");
    }
  }

  private static cheerioExtract(
    $: cheerio.CheerioAPI,
    extractor: CheerioExtractor,
  ): string {
    try {
      return extractor.take == "first"
        ? $(extractor.find).first().text()
        : extractor.take == "last"
        ? $(extractor.find).last().text()
        : $(extractor.find).text();
    } catch {
      return "";
    }
  }

  private static replaceAndTransformSingle(
    value: string,
    extractor: CheerioExtractor,
  ): string {
    try {
      let finalValue = value;
      if (finalValue) {
        finalValue = finalValue.replace(/\n/g, "").replace(/  /g, "").trim();
        if (extractor.transform) {
          finalValue = extractor.transform(finalValue);
        }
      }
      return finalValue;
    } catch {
      return "";
    }
  }
}
