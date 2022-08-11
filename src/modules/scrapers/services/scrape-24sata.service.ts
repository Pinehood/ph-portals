import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import axios from "axios";
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
export class Scrape24SataService implements ScraperService {
  roots: string[];
  name: string;
  link: string;
  type: Portals;
  default: Article;

  constructor(
    @InjectPinoLogger(Scrape24SataService.name)
    private readonly logger: PinoLogger
  ) {
    this.type = Portals.SATA24;
    this.name = getPortalName(this.type);
    this.link = "https://www.24sata.hr";
    this.default = getDefaultArticle(this.type, this.link, this.name);
    this.roots = [
      "https://www.24sata.hr/feeds/aktualno.xml",
      "https://www.24sata.hr/feeds/najnovije.xml",
      "https://www.24sata.hr/feeds/news.xml",
      "https://www.24sata.hr/feeds/sport.xml",
      "https://www.24sata.hr/feeds/show.xml",
      "https://www.24sata.hr/feeds/lifestyle.xml",
      "https://www.24sata.hr/feeds/tech.xml",
      "https://www.24sata.hr/feeds/fun.xml",
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
            .filter((articleLink) => articleLink.includes("-"));
          if (articleLinks) {
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
                  let title = $("h1.article__title").text();
                  if (title) {
                    title = title.replace(/\n/g, "").trim();
                  }
                  let lead = $("p.article__lead_text").text();
                  if (lead) {
                    lead = lead.replace(/\n/g, "").trim();
                  }
                  let time = $("time.article__time").text();
                  if (time) {
                    time = time.replace(/\n/g, "").trim();
                  } else {
                    time = "nedostupno";
                  }
                  let author = $("span.article__authors_item").text();
                  if (author) {
                    author = author
                      .replace(/\n/g, "")
                      .replace(/Piše/g, "")
                      .replace(/  /g, "")
                      .trim();
                    author = author.substring(0, author.length - 1);
                  }
                  let content = $("div.article__content").html();
                  if (content) {
                    content = content
                      .replace(/<h3>Najčitaniji članci<\/h3>/g, "")
                      .replace(/\n/g, "")
                      .trim();
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
