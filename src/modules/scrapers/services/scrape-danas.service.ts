import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import axios from "@common/axios";
import * as cheerio from "cheerio";
import { Portals } from "@common/constants";
import { Article } from "@resources/dtos";
import {
  getDefaultArticle,
  getPortalName,
  isValidArticle,
  shouldArticleBeDisplayed,
  TryCatch,
} from "@common/functions";
import { ScraperService } from "@scrapers/services/scraper.service";

@Injectable()
export class ScrapeDanasService implements ScraperService {
  roots: string[];
  name: string;
  link: string;
  type: Portals;
  default: Article;

  constructor(
    @InjectPinoLogger(ScrapeDanasService.name)
    private readonly logger: PinoLogger
  ) {
    this.type = Portals.DANAS;
    this.name = getPortalName(this.type);
    this.link = "https://www.danas.hr";
    this.default = getDefaultArticle(this.type, this.link, this.name);
    this.roots = [
      "https://www.danas.hr/hrvatska",
      "https://www.danas.hr/svijet",
      "https://www.danas.hr/sport",
    ];
  }

  async articleLinks(): Promise<string[]> {
    const articleLinks: string[] = [];
    for (let i = 0; i < this.roots.length; i++) {
      const rootLink = this.roots[i];
      await TryCatch(async () => {
        const articlesData = await axios.get(rootLink);
        if (articlesData && articlesData.data) {
          const $ = cheerio.load(articlesData.data as string);
          $("div.articleCard a.cardInner").each((_index, el) => {
            const articleLink = this.link + $(el).attr("href");
            if (
              articleLinks.findIndex((el) => el == articleLink) == -1 &&
              articleLink.startsWith("https://")
            ) {
              articleLinks.push(articleLink);
            }
          });
        }
      });
    }
    return articleLinks;
  }

  async scrape(): Promise<Article[]> {
    let articles: Article[] = [];
    const articleLinks = await this.articleLinks();
    if (articleLinks && articleLinks.length > 0) {
      for (let i = 0; i < articleLinks.length; i++) {
        const articleLink = articleLinks[i];
        if (articles.findIndex((a) => a.articleLink == articleLink) > -1)
          continue;

        await TryCatch(async () => {
          const article = await axios.get(articleLink);
          if (article && article.data) {
            const articleHtml = article.data as string;
            const $ = cheerio.load(articleHtml);
            $("img").remove();
            $("iframe").remove();
            $("figure").remove();
            $("picture").remove();
            let title = $("span.titleContent").first().text();
            if (title) {
              title = title.replace(/\n/g, "").trim();
            }
            let lead = $("span.subtitle").text();
            if (lead) {
              lead = lead.replace(/\n/g, "").trim();
            }
            let author = $("div.meta_info_items a").text().trim();
            if (author) {
              author = author.replace(/\n/g, "").replace(/  /g, "").trim();
            }
            let time = $("div.meta_info_items").first().text();
            if (time) {
              time = time.replace(/\n/g, "").trim().split("/")[0];
            } else {
              time = "nedostupno";
            }
            $("section").remove();
            $("style").remove();
            $("span.Slot_title").remove();
            $("div.Slot_content").remove();
            $("svg").remove();
            $("path").remove();
            let content = $("article.article-body").html();
            if (content) {
              content = content.replace(/\n/g, "").trim();
            }
            articles.push({
              ...this.default,
              articleId: articleLink.substring(
                articleLink.lastIndexOf("-") + 1
              ),
              articleLink,
              author,
              content,
              lead,
              time,
              title,
            });
          }
        });
      }
      articles = articles.filter(
        (a) => isValidArticle(a) && shouldArticleBeDisplayed(a)
      );
    }
    this.logger.info(
      "Scraped '%d' articles from '%s'",
      articles.length,
      this.name
    );
    return articles;
  }
}
