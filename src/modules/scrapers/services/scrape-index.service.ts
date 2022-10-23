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
} from "@resources/common/functions";
import { ScraperService } from "@scrapers/services/scraper.service";

@Injectable()
export class ScrapeIndexService implements ScraperService {
  roots: string[];
  name: string;
  link: string;
  type: Portals;
  default: Article;

  constructor(
    @InjectPinoLogger(ScrapeIndexService.name)
    private readonly logger: PinoLogger
  ) {
    this.type = Portals.INDEX;
    this.name = getPortalName(this.type);
    this.link = "https://www.index.hr";
    this.default = getDefaultArticle(this.type, this.link, this.name);
    this.roots = [
      "https://www.index.hr/rss",
      "https://www.index.hr/rss/vijesti",
      "https://www.index.hr/rss/najcitanije",
      "https://www.index.hr/rss/sport",
    ];
  }

  async articleLinks(): Promise<string[]> {
    //TODO
    return [];
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
            .filter((articleLink) => !this.roots.includes(articleLink));
          const articleLeads = (rss.data as string)
            .match(/<description>(.*?)<\/description>/g)
            .map((articleLead) =>
              articleLead
                .replace("<description>", "")
                .replace("</description>", "")
            )
            .filter((articleLead) => articleLead != "Index.hr RSS Feed");
          if (articleLinks && articleLeads) {
            for (let j = 0; j < articleLinks.length; j++) {
              const articleLink = articleLinks[j];
              const articleLead = articleLeads[j];
              if (articles.findIndex((a) => a.articleLink == articleLink) > -1)
                continue;

              try {
                const article = await axios.get(articleLink);
                if (article && article.data) {
                  const articleHtml = article.data as string;
                  const $ = cheerio.load(articleHtml);
                  $("div.js-slot-container").remove();
                  $("div.brid").remove();
                  $("img").remove();
                  $("iframe").remove();
                  let title = $("h1.title").text();
                  if (title) {
                    title = title.replace(/\n/g, "").trim();
                  }
                  let lead = articleLead;
                  if (lead) {
                    lead = lead.replace(/\n/g, "").trim();
                  }
                  let time = $("span.time.sport-text").text();
                  if (time) {
                    time = time.replace(/\n/g, "").trim();
                  } else {
                    time = "nedostupno";
                  }
                  let author = $("span.author").text();
                  if (author) {
                    author = author
                      .replace(/\n/g, "")
                      .replace(/  /g, "")
                      .trim();
                  }
                  let content = $("div.text").html();
                  if (content) {
                    content = content
                      .replace(
                        /Znate li nešto više o temi ili želite prijaviti grešku u tekstu\?/g,
                        ""
                      )
                      .replace(/USKORO OPŠIRNIJE/g, "")
                      .replace(/\n/g, "")
                      .trim();
                  }
                  articles.push({
                    ...this.default,
                    articleId: articleLink
                      .substring(articleLink.lastIndexOf("/") + 1)
                      .replace(".aspx", ""),
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
