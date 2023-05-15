import * as cheerio from "cheerio";
import axios from "@common/axios";
import {
  getDefaultArticle,
  isValidArticle,
  ScraperConfig,
  shouldArticleBeDisplayed,
  TryCatch,
} from "@root/common";
import { Article } from "@root/resources";

export class ConfiguredScraperService {
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
        const articleLinks = await config.links(rootLink);
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

                let title =
                  config.title.find === "first"
                    ? $(config.title.find).first().text()
                    : config.title.find === "last"
                    ? $(config.title.find).last().text()
                    : $(config.title.find).text();
                if (title) {
                  title = title.replace(/\n/g, "").replace(/  /g, "").trim();
                  if (config.title.replace) {
                    config.title.replace.forEach((replace) => {
                      title = title
                        .replace(new RegExp(replace, "g"), "")
                        .trim();
                    });
                  }
                  if (config.title.transform) {
                    title = config.title.transform(title);
                  }
                }

                let lead =
                  config.lead.find === "first"
                    ? $(config.lead.find).first().text()
                    : config.lead.find === "last"
                    ? $(config.lead.find).last().text()
                    : $(config.lead.find).text();
                if (lead) {
                  lead = lead.replace(/\n/g, "").replace(/  /g, "").trim();
                  if (config.lead.replace) {
                    config.lead.replace.forEach((replace) => {
                      lead = lead.replace(new RegExp(replace, "g"), "").trim();
                    });
                  }
                  if (config.lead.transform) {
                    lead = config.lead.transform(lead);
                  }
                }

                let time =
                  config.time.find === "first"
                    ? $(config.time.find).first().text()
                    : config.time.find === "last"
                    ? $(config.time.find).last().text()
                    : $(config.time.find).text();
                if (time) {
                  time = time.replace(/\n/g, "").replace(/  /g, "").trim();
                  if (config.time.replace) {
                    config.time.replace.forEach((replace) => {
                      time = time.replace(new RegExp(replace, "g"), "").trim();
                    });
                  }
                  if (config.time.transform) {
                    time = config.time.transform(time);
                  }
                } else {
                  time = "N/A";
                }

                let author =
                  config.author.find === "first"
                    ? $(config.author.find).first().text()
                    : config.author.find === "last"
                    ? $(config.author.find).last().text()
                    : $(config.author.find).text();
                if (author) {
                  author = author.replace(/\n/g, "").replace(/  /g, "").trim();
                  if (config.author.replace) {
                    config.author.replace.forEach((replace) => {
                      author = author
                        .replace(new RegExp(replace, "g"), "")
                        .trim();
                    });
                  }
                  if (config.author.transform) {
                    author = config.author.transform(author);
                  }
                }

                if (config.remove2) {
                  config.remove2.forEach((removal) => $(removal).remove());
                }

                let content = $(config.content.find).html();
                if (content) {
                  content = content.replace(/\n/g, "");
                  if (config.content.replace) {
                    config.content.replace.forEach((replace) => {
                      content = content
                        .replace(new RegExp(replace, "g"), "")
                        .trim();
                    });
                  }
                }

                articles.push({
                  ...defaultArticle,
                  articleId: await config.id(articleLink),
                  articleLink,
                  author,
                  content,
                  lead,
                  time,
                  title,
                });
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
}
