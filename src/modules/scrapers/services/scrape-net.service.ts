import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import axios from "@common/axios";
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
            .filter(
              (articleLink) =>
                articleLink != "https://net.hr" &&
                articleLink != this.link &&
                !this.roots.includes(articleLink)
            );
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
              author = author.replace(/\n/g, "").replace(/\//g, ",").trim();
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
