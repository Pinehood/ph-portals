import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Article, ArticleInfo, Portal, ScraperStats } from "@/dtos";
import { CommonConstants, Portals, PORTAL_SCRAPERS } from "@/common";
import { PortalsService } from "@/services/portals.service";

@Injectable()
export class ApiService {
  constructor(
    @InjectPinoLogger(ApiService.name)
    private readonly logger: PinoLogger,
    private readonly portalsService: PortalsService
  ) {}

  getPortals(): Portal[] {
    const portals: Portal[] = [];
    Object.keys(Portals).forEach((value) => {
      const portal = Portals[value];
      const ps = PORTAL_SCRAPERS[portal] as any;
      if (portal != Portals.HOME) {
        portals.push({
          name: ps.name,
          value: portal,
        });
      }
    });
    return portals;
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
      for (const portal in Portals) {
        const stats = this.getStats(Portals[portal]);
        if (stats) {
          articles += stats.articles;
          duration += stats.duration;
        }
      }
      return { articles, date: Date.now(), duration };
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
    withContent: string
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
