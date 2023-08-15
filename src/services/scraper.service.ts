import { randomUUID } from "crypto";
import * as cheerio from "cheerio";
import axios from "@/common/axios";
import {
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
        config.name
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
              config.linker
            )
          : [];
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

                const title =
                  config.title.find == "first"
                    ? $(config.title.find).first().text()
                    : config.title.find == "last"
                    ? $(config.title.find).last().text()
                    : $(config.title.find).text();

                const lead =
                  config.lead.find == "first"
                    ? $(config.lead.find).first().text()
                    : config.lead.find == "last"
                    ? $(config.lead.find).last().text()
                    : $(config.lead.find).text();

                const time =
                  config.time.find == "first"
                    ? $(config.time.find).first().text()
                    : config.time.find == "last"
                    ? $(config.time.find).last().text()
                    : $(config.time.find).text();

                const author =
                  config.author.find == "first"
                    ? $(config.author.find).first().text()
                    : config.author.find == "last"
                    ? $(config.author.find).last().text()
                    : $(config.author.find).text();

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
      (a) => isValidArticle(a) && shouldArticleBeDisplayed(a)
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
    find: string
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

  private static replaceAndTransform(
    article: Article,
    config: ScraperConfig
  ): void {
    if (article.title) {
      article.title = article.title
        .replace(/\n/g, "")
        .replace(/  /g, "")
        .trim();
      if (config.title.replace) {
        config.title.replace.forEach((replace) => {
          article.title = article.title
            .replace(new RegExp(replace, "g"), "")
            .trim();
        });
      }
      if (config.title.transform) {
        article.title = config.title.transform(article.title);
      }
    }

    if (article.lead) {
      article.lead = article.lead.replace(/\n/g, "").replace(/  /g, "").trim();
      if (config.lead.replace) {
        config.lead.replace.forEach((replace) => {
          article.lead = article.lead
            .replace(new RegExp(replace, "g"), "")
            .trim();
        });
      }
      if (config.lead.transform) {
        article.lead = config.lead.transform(article.lead);
      }
    }

    if (article.time) {
      article.time = article.time.replace(/\n/g, "").replace(/  /g, "").trim();
      if (config.time.replace) {
        config.time.replace.forEach((replace) => {
          article.time = article.time
            .replace(new RegExp(replace, "g"), "")
            .trim();
        });
      }
      if (config.time.transform) {
        article.time = config.time.transform(article.time);
      }
    }

    if (article.author) {
      article.author = article.author
        .replace(/\n/g, "")
        .replace(/  /g, "")
        .trim();
      if (config.author.replace) {
        config.author.replace.forEach((replace) => {
          article.author = article.author
            .replace(new RegExp(replace, "g"), "")
            .trim();
        });
      }
      if (config.author.transform) {
        article.author = config.author.transform(article.author);
      }
    }

    if (article.content) {
      article.content = article.content.replace(/\n/g, "");
      if (config.content.replace) {
        config.content.replace.forEach((replace) => {
          article.content = article.content
            .replace(new RegExp(replace, "g"), "")
            .trim();
        });
      }
    }
  }
}
