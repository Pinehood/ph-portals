import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Article, ArticleInfo, Portal, ScraperStats } from "@resources/dtos";
import { getPortalName } from "@common/functions";
import { CommonConstants, Portals, RedisStatsKeys } from "@common/constants";
import { RedisService } from "@utils/services";

@Injectable()
export class ApiService {
  constructor(
    @InjectPinoLogger(ApiService.name)
    private readonly logger: PinoLogger,
    private readonly redisService: RedisService
  ) {}

  getPortals(): Portal[] {
    const portals: Portal[] = [];
    Object.keys(Portals).forEach((value) => {
      const portal = Portals[value];
      if (portal != Portals.HOME) {
        portals.push({
          name: getPortalName(portal),
          value: portal,
        });
      }
    });
    return portals;
  }

  async getArticles(
    portal: Portals,
    withContent: string
  ): Promise<ArticleInfo[]> {
    try {
      const articles = JSON.parse(
        await this.redisService.get(portal)
      ) as Article[];
      if (!articles) return null;
      return articles.map((a) => this.articleToArticleInfo(a, withContent));
    } catch (error: any) {
      this.logger.error(error);
      return null;
    }
  }

  async getTotalStats(): Promise<ScraperStats> {
    try {
      let articles = 0;
      let duration = 0;
      for (const portal in Portals) {
        const stats = await this.getStats(Portals[portal]);
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

  async getStats(portal: Portals): Promise<ScraperStats> {
    try {
      if (portal == Portals.HOME) return null;
      const date = parseInt(
        await this.redisService.get(
          RedisStatsKeys.LAST_REFRESHED_ON_PREFIX + portal
        )
      );
      const articles = parseInt(
        await this.redisService.get(
          RedisStatsKeys.TOTAL_SCRAPED_ARTICLES_PREFIX + portal
        )
      );
      const duration = parseInt(
        await this.redisService.get(
          RedisStatsKeys.TOTAL_SCRAPING_TIME_PREFIX + portal
        )
      );
      return { articles, date, duration };
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
