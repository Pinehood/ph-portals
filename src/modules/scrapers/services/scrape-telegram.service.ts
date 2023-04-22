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

@Injectable()
export class ScrapeTelegramService implements ScraperService {
  roots: string[];
  name: string;
  link: string;
  type: Portals;
  default: Article;

  constructor(
    @InjectPinoLogger(ScrapeTelegramService.name)
    private readonly logger: PinoLogger
  ) {
    this.type = Portals.TELEGRAM;
    this.name = getPortalName(this.type);
    this.link = "https://telegram.hr";
    this.default = getDefaultArticle(this.type, this.link, this.name);
    this.roots = [
      "https://www.telegram.hr/api/category/najnovije/page/1",
      "https://www.telegram.hr/api/category/najnovije/page/2",
      "https://www.telegram.hr/api/category/najnovije/page/3",
      "https://www.telegram.hr/api/category/najnovije/page/4",
      "https://www.telegram.hr/api/category/najnovije/page/5",
    ];
  }

  async articleLinks(): Promise<string[]> {
    return this.roots;
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
            const obj = JSON.parse(article.data) as {
              category: string;
              description: string;
              posts: any[];
            };
            if (obj.posts && obj.posts.length > 0) {
              obj.posts.forEach((post) => {
                if (post.paywall == "none" || post.paywall == "never") {
                  articles.push({
                    ...this.default,
                    articleId: post.id,
                    articleLink: this.link + post.permalink,
                    author: (post.authors as any[])
                      .map((author) => author.name)
                      .join(","),
                    content: post.content,
                    lead: post.description,
                    time: new Date(parseInt(post.time) * 1000).toUTCString(),
                    title: post.portal_title,
                  });
                }
              });
            }
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
