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
export class ScrapeDirektnoService implements ScraperService {
  roots: string[];
  name: string;
  link: string;
  type: Portals;
  default: Article;

  constructor(
    @InjectPinoLogger(ScrapeDirektnoService.name)
    private readonly logger: PinoLogger
  ) {
    this.type = Portals.DIREKTNO;
    this.name = getPortalName(this.type);
    this.link = "https://www.direktno.hr";
    this.default = getDefaultArticle(this.type, this.link, this.name);
    this.roots = [
      "https://direktno.hr/rss/publish/latest/direkt-50",
      "https://direktno.hr/rss/publish/latest/domovina-10",
      "https://direktno.hr/rss/publish/latest/zagreb-15",
      "https://direktno.hr/rss/publish/latest/eu_svijet",
      "https://direktno.hr/rss/publish/latest/razvoj-110",
      "https://direktno.hr/rss/publish/latest/sport-60",
      "https://direktno.hr/rss/publish/latest/zivot-70",
      "https://direktno.hr/rss/publish/latest/kolumne-80",
      "https://direktno.hr/rss/publish/latest/medijski-partneri-90",
    ];
  }

  async articleLinks(): Promise<string[]> {
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
            let title = $("h1.pd-title").text();
            if (title) {
              title = title.replace(/\n/g, "").trim();
            }
            let lead = $("div.pd-short-desc").text();
            if (lead) {
              lead = lead.replace(/\n/g, "").trim();
            }
            let time = $("div.pd-date").text();
            if (time) {
              time = time.replace(/\n/g, "").trim();
            } else {
              time = "nedostupno";
            }
            let author = $("p.pd-author-name").text();
            if (author) {
              author = author.replace(/\n/g, "").replace(/  /g, "").trim();
            }
            let content = $("div.pd-desc").html();
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
