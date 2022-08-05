import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import axios from "axios";
import * as cheerio from "cheerio";
import { Portals } from "@resources/common/constants";
import { Article } from "@resources/dtos";
import { PortalsRoutes } from "@resources/common/routes";
import {
  isValidArticle,
  shouldArticleBeDisplayed,
} from "@resources/common/functions";
import { ScraperService } from "@scrapers/services/scraper.service";

@Injectable()
export class ScrapeIndexService implements ScraperService {
  rootLinks: string[];
  name: string;
  link: string;

  constructor(
    @InjectPinoLogger(ScrapeIndexService.name)
    private readonly logger: PinoLogger
  ) {
    this.name = "Index";
    this.link = "https://www.index.hr";
    this.rootLinks = [
      "https://www.index.hr/rss",
      "https://www.index.hr/rss/vijesti",
      "https://www.index.hr/rss/najcitanije",
      "https://www.index.hr/rss/sport",
    ];
  }

  async scrape(): Promise<Article[]> {
    let articles: Article[] = [];
    try {
      for (let i = 0; i < this.rootLinks.length; i++) {
        const rootLink = this.rootLinks[i];
        const rss = await axios.get(rootLink);
        if (rss && rss.data) {
          const articleLinks = (rss.data as string)
            .match(/<link>(.*?)<\/link>/g)
            .map((articleLink) =>
              articleLink.replace("<link>", "").replace("</link>", "")
            )
            .filter((articleLink) => !this.rootLinks.includes(articleLink));
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
              if (
                articles.findIndex((a) => a.articleLink == articleLink) > -1
              ) {
                continue;
              }
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
                  author = author.replace(/\n/g, "").replace(/  /g, "").trim();
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
                  ...this.defaultArticle(),
                  articleId: articleLink.substring(
                    articleLink.lastIndexOf("/") + 1
                  ),
                  articleLink,
                  author,
                  content,
                  lead,
                  time,
                  title,
                });
              }
            }
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
    } catch (error: any) {
      this.logger.error(error);
    }
    return articles;
  }

  defaultArticle(): Article {
    return {
      articleId: "",
      articleLink: "",
      author: "",
      backLink: `${PortalsRoutes.BASE}/${Portals.INDEX}`,
      content: "",
      lead: "",
      portalLink: this.link,
      portalName: this.name,
      portalType: Portals.INDEX,
      time: "",
      title: "",
    };
  }
}
