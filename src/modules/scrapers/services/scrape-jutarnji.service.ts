import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import axios from "@resources/common/axios";
import * as cheerio from "cheerio";
import { Portals } from "@resources/common/constants";
import { Article } from "@resources/dtos";
import {
  getDefaultArticle,
  getPortalName,
  isValidArticle,
  shouldArticleBeDisplayed,
  TryCatch,
} from "@resources/common/functions";
import { ScraperService } from "@scrapers/services/scraper.service";

@Injectable()
export class ScrapeJutarnjiService implements ScraperService {
  roots: string[];
  name: string;
  link: string;
  type: Portals;
  default: Article;

  constructor(
    @InjectPinoLogger(ScrapeJutarnjiService.name)
    private readonly logger: PinoLogger
  ) {
    this.type = Portals.JUTARNJI;
    this.name = getPortalName(this.type);
    this.link = "https://www.jutarnji.hr";
    this.default = getDefaultArticle(this.type, this.link, this.name);
    this.roots = [
      "https://www.jutarnji.hr/vijesti",
      "https://www.jutarnji.hr/vijesti/hrvatska",
      "https://www.jutarnji.hr/vijesti/svijet",
      "https://www.jutarnji.hr/vijesti/zagreb",
      "https://www.jutarnji.hr/vijesti/crna-kronika",
    ];
  }

  async articleLinks(): Promise<string[]> {
    const articleLinks: string[] = [];
    for (let i = 0; i < this.roots.length; i++) {
      const rootLink = this.roots[i];
      await TryCatch(this.logger, rootLink, async () => {
        const articlesData = await axios.get(rootLink);
        if (articlesData && articlesData.data) {
          const $ = cheerio.load(articlesData.data as string);
          $("a.card__article-link").each((_index, el) => {
            const articleLink = $(el).attr("href");
            if (articleLinks.findIndex((el) => el == articleLink) == -1) {
              articleLinks.push(rootLink + articleLink);
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

        await TryCatch(this.logger, articleLink, async () => {
          const article = await axios.get(articleLink);
          if (article && article.data) {
            const articleHtml = article.data as string;
            const $ = cheerio.load(articleHtml);
            $("img").remove();
            $("iframe").remove();
            $("div.se-embed").remove();
            $("div.se-embed--photo").remove();
            $("div.item__related").remove();
            $("script").remove();
            let title = $("h1.item__title").text();
            if (title) {
              title = title.replace(/\n/g, "").trim();
            }
            let lead = $("div.item__subtitle").text();
            if (lead) {
              lead = lead.replace(/\n/g, "").trim();
            }
            let time = $("span.item__author__date").text();
            if (time) {
              time = time.replace(/\n/g, "").trim();
            }
            let author = $("span.item__author-name").text();
            if (author) {
              author = author.replace(/\n/g, "").replace(/  /g, "").trim();
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
