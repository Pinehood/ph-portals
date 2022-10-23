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
    const articleLinks: string[] = [];
    for (let i = 0; i < this.roots.length; i++) {
      const rootLink = this.roots[i];
      await TryCatch(this.logger, rootLink, async () => {
        const rss = await axios.get(rootLink);
        if (rss && rss.data) {
          const links = (rss.data as string)
            .match(/<link>(.*?)<\/link>/g)
            .map((articleLink) =>
              articleLink.replace("<link>", "").replace("</link>", "")
            )
            .filter((articleLink) => !this.roots.includes(articleLink));
          if (links && links.length > 0) articleLinks.push(...links);
        }
      });
    }
    return articleLinks;
  }

  async scrape(): Promise<Article[]> {
    let articles: Article[] = [];
    const articleLinks = await this.articleLinks();
    const articleLeads = await this.articleLeads();
    if (
      articleLinks &&
      articleLeads &&
      articleLinks.length > 0 &&
      articleLeads.length > 0
    ) {
      for (let i = 0; i < articleLinks.length; i++) {
        const articleLink = articleLinks[i];
        const articleLead = articleLeads[i];
        if (articles.findIndex((a) => a.articleLink == articleLink) > -1)
          continue;

        await TryCatch(this.logger, articleLink, async () => {
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
            let time = $("div.flex-1").last().text();
            if (time) {
              time = time.replace(/\n/g, "").trim();
            } else {
              time = "nedostupno";
            }
            let author = $("div.flex-1").first().text();
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

  private async articleLeads(): Promise<string[]> {
    const articleLeads: string[] = [];
    for (let i = 0; i < this.roots.length; i++) {
      const rootLink = this.roots[i];
      await TryCatch(this.logger, rootLink, async () => {
        const rss = await axios.get(rootLink);
        if (rss && rss.data) {
          const leads = (rss.data as string)
            .match(/<description>(.*?)<\/description>/g)
            .map((articleLead) =>
              articleLead
                .replace("<description>", "")
                .replace("</description>", "")
            )
            .filter((articleLead) => articleLead != "Index.hr RSS Feed");
          if (leads && leads.length > 0) articleLeads.push(...leads);
        }
      });
    }
    return articleLeads;
  }
}
