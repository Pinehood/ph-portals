import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Portals } from "@resources/common/constants";
import { Article } from "@resources/dtos";
import {
  getDefaultArticle,
  getPortalName,
  isValidArticle,
  shouldArticleBeDisplayed,
} from "@resources/common/functions";
import * as cheerio from "cheerio";
import axios from "axios";
import { ScraperService } from "@scrapers/services/scraper.service";

@Injectable()
export class ScrapeSportskeNovostiService implements ScraperService {
  roots: string[];
  name: string;
  link: string;
  type: Portals;
  default: Article;

  constructor(
    @InjectPinoLogger(ScrapeSportskeNovostiService.name)
    private readonly logger: PinoLogger
  ) {
    this.type = Portals.SPORTSKE_NOVOSTI;
    this.name = getPortalName(this.type);
    this.link = "https://sportske.jutarnji.hr";
    this.default = getDefaultArticle(this.type, this.link, this.name);
    this.roots = [
      "https://sportske.jutarnji.hr/sn/nogomet/bundesliga/",
      "https://sportske.jutarnji.hr/sn/nogomet/serie-a/",
      "https://sportske.jutarnji.hr/sn/nogomet/premiership/",
      "https://sportske.jutarnji.hr/sn/nogomet/le-championnat",
      "https://sportske.jutarnji.hr/sn/nogomet/primera",
      "https://sportske.jutarnji.hr/sn/nogomet/reprezentacija/",
    ];
  }

  async scrape(): Promise<Article[]> {
    let articles: Article[] = [];
    for (let i = 0; i < this.roots.length; i++) {
      const rootLink = this.roots[i];
      try {
        const articleLinks = [];
        const articleData = await axios.get(rootLink);
        if (articleData && articleData.data) {
          const data = articleData.data as string;
          const $ = cheerio.load(data);
          $("image").remove();
          $("iframe").remove();
          $("main a[class=card__article-link]").each((_index, el) => {
            const articleLink = $(el).attr("href");
            if (articleLinks.findIndex((el) => el == articleLink) == -1) {
              articleLinks.push(this.link + articleLink);
            }
          });
        }

        for (let j = 0; j < articleLinks.length; j++) {
          const articleLink = articleLinks[j];
          if (articles.findIndex((a) => a.articleLink == articleLink) > -1)
            continue;

          try {
            const article = await axios.get(articleLink);
            if (article && article.data) {
              const articleHtml = article.data as string;
              const $ = cheerio.load(articleHtml);
              $("img").remove();
              $("iframe").remove();
              $("figure").remove();
              $("picture").remove();
              $("script").remove();
              let title = $("h1.item__title").text();
              if (title) {
                title = title.replace(/\n/g, "").trim();
              }
              let lead = $("div.item__subtitle").text();
              if (lead) {
                lead = lead.replace(/\n/g, "").trim();
              }
              let author = $("span.item__author-name").text();
              if (author) {
                author = author.replace(/\n/g, "").trim();
              }
              let time = $("span.item__author__date").text();
              if (time) {
                time = time.replace(/\n/g, "").trim();
              } else {
                time = "nedostupno";
              }
              let content = $("div.itemFullText").html();
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
          } catch (innerError: any) {
            if (
              innerError.response &&
              innerError.response.status &&
              innerError.response.status >= 400
            ) {
              this.logger.error(
                "Failed to retrieve data for article '%s' with status code '%d'",
                articleLink,
                innerError.response.status
              );
            } else {
              this.logger.error(innerError);
            }
          }
        }
      } catch (error: any) {
        if (
          error.response &&
          error.response.status &&
          error.response.status >= 400
        ) {
          this.logger.error(
            "Failed to retrieve data for root '%s' with status code '%d'",
            rootLink,
            error.response.status
          );
        } else {
          this.logger.error(error);
        }
      }
    }
    articles = articles.filter(
      (a) => isValidArticle(a) && shouldArticleBeDisplayed(a)
    );
    this.logger.info(
      "Scraped '%d' articles from '%s'",
      articles.length,
      this.name
    );
    return articles;
  }
}
