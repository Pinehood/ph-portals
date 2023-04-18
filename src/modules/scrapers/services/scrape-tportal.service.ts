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
export class ScrapeTportalService implements ScraperService {
  roots: string[];
  name: string;
  link: string;
  type: Portals;
  default: Article;

  constructor(
    @InjectPinoLogger(ScrapeTportalService.name)
    private readonly logger: PinoLogger
  ) {
    this.type = Portals.TPORTAL;
    this.name = getPortalName(this.type);
    this.link = "https://www.tportal.hr";
    this.default = getDefaultArticle(this.type, this.link, this.name);
    this.roots = ["https://www.tportal.hr/najnovije-vijesti"];
  }

  async articleLinks(): Promise<string[]> {
    const articleLinks: string[] = [];
    for (let i = 0; i < this.roots.length; i++) {
      const rootLink = this.roots[i];
      await TryCatch(async () => {
        const articlesData = await axios.get(rootLink);
        if (articlesData && articlesData.data) {
          const $ = cheerio.load(articlesData.data as string);
          $("a.articlePreview").each((_index, el) => {
            const articleLink = $(el).attr("href");
            if (articleLinks.findIndex((el) => el == articleLink) == -1) {
              if (articleLink.startsWith("//")) {
                articleLinks.push("https:" + articleLink);
              } else if (articleLink.startsWith("/")) {
                articleLinks.push(this.link + articleLink);
              } else {
                articleLinks.push(articleLink);
              }
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
            $("div.banner").remove();
            $("div.embedComponent").remove();
            $("div.autoRelatedArticles").remove();
            $("div.listComponentType2").remove();
            $("figure").remove();
            $("figcaption").remove();
            let title = $("h1.js_articleTitle").text();
            if (title) {
              title = title.replace(/\n/g, "").trim();
            }
            let lead = $("div.js_articleText p").first().text();
            if (lead) {
              lead = lead.replace(/\n/g, "").trim();
            }
            let time = $("header.relative div.basis-full div.flex div.flex")
              .last()
              .text();
            if (time) {
              time = time.replace("Objavljeno", "").replace(/\n/g, "").trim();
            }
            let author = $('a[href^="/autor"] p').text();
            if (author) {
              author = author
                .replace("Autor: ", "")
                .replace(/\n/g, "")
                .replace(/  /g, "")
                .split("Zadnja")[0]
                .trim();
            }
            let content = $("div.article-content").html();
            if (content) {
              content = content.replace(/\n/g, "").trim();
            }
            articles.push({
              ...this.default,
              articleId: Math.floor(
                100000000 + Math.random() * 900000000
              ).toString(),
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
