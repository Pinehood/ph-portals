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
export class ScrapeZagrebService implements ScraperService {
  roots: string[];
  name: string;
  link: string;
  type: Portals;
  default: Article;

  constructor(
    @InjectPinoLogger(ScrapeZagrebService.name)
    private readonly logger: PinoLogger
  ) {
    this.type = Portals.ZAGREB;
    this.name = getPortalName(this.type);
    this.link = "https://www.zagreb.info";
    this.default = getDefaultArticle(this.type, this.link, this.name);
    this.roots = ["https://www.zagreb.info/feed"];
  }

  async links(): Promise<string[]> {
    const articleLinks: string[] = [];
    for (let i = 0; i < this.roots.length; i++) {
      const rootLink = this.roots[i];
      await TryCatch(async () => {
        const rss = await axios.get(rootLink);
        if (rss && rss.data) {
          const links = (rss.data as string)
            .match(/<link>(.*?)<\/link>/g)
            .map((articleLink) =>
              articleLink.replace("<link>", "").replace("</link>", "")
            )
            .filter((articleLink) => articleLink.includes("-"));
          if (links && links.length > 0) articleLinks.push(...links);
        }
      });
    }
    return articleLinks;
  }

  async scrape(): Promise<Article[]> {
    let articles: Article[] = [];
    const articleLinks = await this.links();
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
            $("div.wpipa-container").remove();
            let title = $("h1.entry-title").text();
            if (title) {
              title = title.replace(/\n/g, "").trim();
            }
            let lead = "";
            if (lead) {
              lead = lead.replace(/\n/g, "").trim();
            }
            let time = $("time.entry-date").text();
            if (time) {
              time = time.replace(/\n/g, "").trim();
            } else {
              time = "nedostupno";
            }
            let author = $("div.td-post-author-name strong").text();
            if (author) {
              author = author.replace(/\n/g, "").replace(/  /g, "").trim();
            }
            $("div.td-post-featured-image").remove();
            $("iframe.instagram-media").remove();
            $("div.under-article-ads").remove();
            $("div.td-post-sharing-bottom").remove();
            $("div.fb-comments").remove();
            $("h3").remove();
            let content = $("div.td-post-content").html();
            if (content) {
              content = content.replace(/\n/g, "").trim();
            }
            articles.push({
              ...this.default,
              articleId: articleLink
                .substring(articleLink.lastIndexOf("-") + 1)
                .replace("/", "-")
                .replace("/", "")
                .split("-")[1],
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
