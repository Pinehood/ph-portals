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
export class ScrapeDnevnoService implements ScraperService {
  roots: string[];
  name: string;
  link: string;
  type: Portals;
  default: Article;

  constructor(
    @InjectPinoLogger(ScrapeDnevnoService.name)
    private readonly logger: PinoLogger
  ) {
    this.type = Portals.DNEVNO;
    this.name = getPortalName(this.type);
    this.link = "https://www.dnevno.hr";
    this.default = getDefaultArticle(this.type, this.link, this.name);
    this.roots = [
      "https://www.dnevno.hr/category/vijesti/",
      "https://www.dnevno.hr/category/sport",
      "https://www.dnevno.hr/category/magazin",
      "https://www.dnevno.hr/category/gospodarstvo-i-turizam",
      "https://www.dnevno.hr/category/zdravlje",
      "https://www.dnevno.hr/category/domovina",
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
          $("article.post a").each((_index, el) => {
            const articleLink = $(el).attr("href");
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
            let title = $("h1").text();
            if (title) {
              title = title.replace(/\n/g, "").trim();
            }
            let lead = $("a.title").text();
            if (lead) {
              lead = lead.replace(/\n/g, "").trim();
            }
            let time = $("time.date").first().text();
            if (time) {
              time = time.replace(/\n/g, "").trim();
            }
            let author = $("span.author").first().text();
            if (author) {
              author = author
                .replace("Autor: ", "")
                .replace(/\n/g, "")
                .replace(/  /g, "")
                .trim();
            }
            $("div.img-holder").remove();
            $("div.heading").remove();
            $("h1").remove();
            $("style").remove();
            $("div.info").remove();
            $("div.info-holder").remove();
            let content = $("section.description").html();
            if (content) {
              content = content.replace(/\n/g, "").trim();
            }
            articles.push({
              ...this.default,
              articleId: articleLink
                .substring(articleLink.lastIndexOf("-") + 1)
                .replace("/", ""),
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
