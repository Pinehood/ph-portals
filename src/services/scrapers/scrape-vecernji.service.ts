import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import axios from "@/common/axios";
import * as cheerio from "cheerio";
import { Article } from "@/dtos";
import {
  getDefaultArticle,
  getPortalName,
  isValidArticle,
  Portals,
  ScraperService,
  shouldArticleBeDisplayed,
  TryCatch,
} from "@/common";

@Injectable()
export class ScrapeVecernjiService implements ScraperService {
  roots: string[];
  name: string;
  link: string;
  type: Portals;
  default: Article;

  constructor(
    @InjectPinoLogger(ScrapeVecernjiService.name)
    private readonly logger: PinoLogger
  ) {
    this.type = Portals.VECERNJI;
    this.name = getPortalName(this.type);
    this.link = "https://www.vecernji.hr";
    this.default = getDefaultArticle(this.type, this.link, this.name);
    this.roots = [
      "https://www.vecernji.hr/hrvatska",
      "https://www.vecernji.hr/crna-kronika",
      "https://www.vecernji.hr/svijet",
      "https://www.vecernji.hr/sport",
      "https://www.vecernji.hr/zagreb",
      "https://www.vecernji.hr/showbiz",
      "https://www.vecernji.hr/biznis",
      "https://www.vecernji.hr/techsci",
      "https://www.vecernji.hr/znanost",
      "https://www.vecernji.hr/zanimljivosti",
    ];
  }

  async links(): Promise<string[]> {
    const articleLinks: string[] = [];
    for (let i = 0; i < this.roots.length; i++) {
      const rootLink = this.roots[i];
      await TryCatch(async () => {
        const articlesData = await axios.get(rootLink);
        if (articlesData && articlesData.data) {
          const $ = cheerio.load(articlesData.data as string);
          $("a.card__link").each((_index, el) => {
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
            $("span.widgetWrap").remove();
            $("div.article__body_banner_article_bottom").remove();
            $("div.image").remove();
            $("div.dfp_banner--divInArticle").remove();
            $("div.js_bannerInArticle2").remove();
            let title = $("h1.single-article__title").text();
            if (title) {
              title = title.replace(/\n/g, "").trim();
            }
            let lead = $("div.single-article__headline").first().text();
            if (lead) {
              lead = lead.replace(/\n/g, "").trim();
            }
            let time = $("span.article__header_date").text();
            if (time) {
              time = time.replace(/\n/g, "").trim();
            } else {
              time = "nedostupno";
            }
            let author = $("div.author__name").text();
            if (author) {
              author = author
                .replace(/\n/g, "")
                .replace(/  /g, "")
                .replace("Autor", "")
                .trim();
            }
            let content = $("div.single-article__content").html();
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
