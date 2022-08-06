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
    this.link = "https://www.Net.hr";
    this.default = getDefaultArticle(this.type, this.link, this.name);
    this.roots = [
      "https://net.hr/feed/danas",
      "https://net.hr/feed/sport",
      "https://net.hr/feed/hot",
      "https://net.hr/feed/magazin",
    ]; //RSS
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
            .filter((articleLink) => articleLink != "https://net.hr");
          if (articleLinks) {
            for (let j = 0; j < articleLinks.length; j++) {
              const articleLink = articleLinks[j];
              if (
                articles.findIndex((a) => (a.articleLink = articleLink)) > -1
              ) {
                continue;
              }
              try {
                const article = await axios.get(articleLink);
                if (article && article.data) {
                  const artcileString = article.data as string;
                  const $ = cheerio.load(artcileString);
                  $("img").remove();
                  $("iframe").remove();
                  $("article.article-body div").remove();
                  let title = $("h1.title").text();
                  if (title) {
                    title = title.replace(/\n/g, "").trim();
                  }
                  let articleLead = $("article.articleHead_lead p").text();
                  if (articleLead) {
                    articleLead = articleLead.replace(/\n/g, "").trim();
                  }
                  let date_time = $("div.metaItem_title").text();
                  if (date_time) {
                    date_time = date_time.split(/[a-z]/gi)[0]
                      ? date_time.split(/[a-z]/gi)[0]
                      : "Nedostupno";
                  }
                  let author = "Nedostupno";
                  let articleBody = $("article.article-body p").text();
                  if (articleBody) {
                    articleBody = articleBody.replace(/\n/g, "").trim();
                  }

                  /* let articleSubtitles = $("article.article-body h2").text();
                  if (articleSubtitles) {
                    let test = articleSubtitles.split(/(?=[A-Z])/);
                    console.log(test);
                  } */

                  /* TO DO Ubacit svaki u articles array , daj mi povratno sam jel mi fali koji prop
                   artikala body je tvoj content
                   mogu uhvatit sve podnaslove al ih nemrem razdvojit jedinstveno za svaki clanak jer svi imaju iste klase (Kod iznad zakomentiran).  

                  */
                }
              } catch (innerError: any) {
                this.logger.error(innerError);
              }
            }
          }
        }
      } catch (error: any) {
        console.log(error);
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
