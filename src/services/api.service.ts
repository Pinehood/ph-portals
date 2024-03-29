import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Article, ArticleInfo, Portal, ScraperStats } from "@/dtos";
import {
  CommonConstants,
  Portals,
  PORTAL_SCRAPERS,
  ScraperConfig,
} from "@/common";
import { PortalsService } from "@/services/portals.service";

@Injectable()
export class ApiService {
  constructor(
    @InjectPinoLogger(ApiService.name)
    private readonly logger: PinoLogger,
    private readonly portalsService: PortalsService,
  ) {}

  getPortals(): Portal[] {
    return Object.keys(Portals)
      .filter((value) => Portals[value] != Portals.HOME)
      .map((value) => {
        const portal = Portals[value];
        const psc = PORTAL_SCRAPERS[portal] as ScraperConfig;
        return {
          name: psc.name,
          value: portal,
        } as Portal;
      });
  }

  getArticles(portal: Portals, withContent: string): ArticleInfo[] {
    try {
      const articles = this.portalsService.getArticles(portal);
      if (!articles) return null;
      return articles.map((a) => this.articleToArticleInfo(a, withContent));
    } catch (error: any) {
      this.logger.error(error);
      return null;
    }
  }

  getTotalStats(): ScraperStats {
    try {
      let articles = 0;
      let duration = 0;
      const now = Date.now();
      for (const portal in Portals) {
        const stats = this.getStats(Portals[portal]);
        if (stats) {
          articles += stats.articles;
          duration += stats.duration;
        }
      }
      return {
        articles,
        date: now,
        duration,
      };
    } catch (error: any) {
      this.logger.error(error);
      return null;
    }
  }

  getStats(portal: Portals): ScraperStats {
    try {
      if (portal == Portals.HOME) return null;
      return this.portalsService.getStats(portal);
    } catch (error: any) {
      this.logger.error(error);
      return null;
    }
  }

  private articleToArticleInfo(
    article: Article,
    withContent: string,
  ): ArticleInfo {
    return {
      articleId: article.articleId,
      articleLink: article.articleLink,
      author: article.author,
      content:
        withContent == CommonConstants.TRUE_STRING ? article.content : "(...)",
      lead: article.lead,
      portalLink: article.portalLink,
      portalName: article.portalName,
      time: article.time,
      title: article.title,
    };
  }
}
