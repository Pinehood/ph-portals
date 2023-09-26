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
import { LinkService } from "@/services/link.service";
import { ExtractionService } from "@/services/extraction.service";
import { TransformService } from "@/services/transform.service";

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
          ? await LinkService.rss(rootLink, config.link)
          : config.linker
          ? await LinkService.normal(rootLink, config.link, config.linker)
          : await LinkService.json(rootLink, config.link);
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
                  : ExtractionService.id(articleLink);

                const title = ExtractionService.cheerio($, config.title);
                const lead = ExtractionService.cheerio($, config.lead);
                const time = ExtractionService.cheerio($, config.time);
                const author = ExtractionService.cheerio($, config.author);

                if (config.remove2) {
                  config.remove2.forEach((removal) => $(removal).remove());
                }

                const content = $(config.content.find)
                  .html()
                  .replace(/href=\"\//g, `href="${config.link}/`)
                  .replace(/src=\"\//g, `src="${config.link}/`);

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
                TransformService.article(articleObj, config);
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
}
