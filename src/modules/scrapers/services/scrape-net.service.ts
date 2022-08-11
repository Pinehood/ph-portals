import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import axios from "axios";
import { Portals } from "@resources/common/constants";
import { Article } from "@resources/dtos";
import {
  getDefaultArticle,
  getPortalName,
  isValidArticle,
  shouldArticleBeDisplayed,
} from "@resources/common/functions";
import { ScraperService } from "@scrapers/services/scraper.service";
import * as cheerio from "cheerio";

@Injectable()
export class ScrapeNetService implements ScraperService {
  roots: string[];
  name: string;
  link: string;
  type: Portals;
  default: Article;

  constructor(
    @InjectPinoLogger(ScrapeNetService.name)
    private readonly logger: PinoLogger
  ) {
    this.type = Portals.NET;
    this.name = getPortalName(this.type);
    this.link = "https://www.net.hr";
    this.default = getDefaultArticle(this.type, this.link, this.name);
    this.roots = [
      "https://net.hr/feed",
      "https://net.hr/feed/danas",
      "https://net.hr/feed/sport",
      "https://net.hr/feed/hot",
      "https://net.hr/feed/magazin",
      "https://net.hr/feed/webcafe",
    ];
  }

  async scrape(): Promise<Article[]> {
    let articles: Article[] = [];
    for (let i = 0; i < this.roots.length; i++) {
      const rootLink = this.roots[i];
      try {
        const rss = await axios.get(rootLink);
        if (rss && rss.data) {
          const articleLinks = (rss.data as string)
            .match(/<link>(.*?)<\/link>/g)
            .map((articleLink) =>
              articleLink.replace("<link>", "").replace("</link>", "")
            )
            .filter(
              (articleLink) =>
                articleLink != "https://net.hr" &&
                articleLink != this.link &&
                !this.roots.includes(articleLink)
            );
          if (articleLinks) {
            for (let j = 0; j < articleLinks.length; j++) {
              const articleLink = articleLinks[j];
              if (
                articles.findIndex((a) => a.articleLink == articleLink) > -1
              ) {
                continue;
              }
              try {
                const article = await axios.get(articleLink);
                if (article && article.data) {
                  const articleHtml = article.data as string;
                  const $ = cheerio.load(articleHtml);
                  $("img").remove();
                  $("iframe").remove();
                  $("div.Image-noPlaceholder").remove();
                  $("div.css-86pgy2").remove();
                  $('div[id="mobileScaleDown"]').remove();
                  $('div[id="desktopScaleDown"]').remove();
                  let title = $("span.title_title").text();
                  if (title) {
                    title = title.replace(/\n/g, "").trim();
                  }
                  let lead = $("span.title_subtitle").text();
                  if (lead) {
                    lead = lead.replace(/\n/g, "").replace(" /", "").trim();
                  }
                  let time = $("div.metaItem_title").text();
                  if (time) {
                    time = time.split(/[a-z]/gi)[0]
                      ? time.split(/[a-z]/gi)[0]
                      : "nedostupno";
                  }
                  let author = $('div[id="meta_author"]').text();
                  if (author) {
                    author = author
                      .replace(/\n/g, "")
                      .replace(/\//g, ",")
                      .trim();
                  }
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
