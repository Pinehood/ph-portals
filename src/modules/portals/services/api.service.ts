import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Article, ArticleInfo, Portal } from "@resources/dtos";
import { getPortalName } from "@resources/common/functions";
import { CommonConstants, Portals } from "@resources/common/constants";
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
      if (Portals[value] != Portals.HOME) {
        portals.push({
          name: getPortalName(Portals[value]),
          value: Portals[value],
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
