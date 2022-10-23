import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
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
    this.roots = []; //Non-RSS
  }

  async articleLinks(): Promise<string[]> {
    return null;
  }

  async scrape(): Promise<Article[]> {
    let articles: Article[] = [];
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
