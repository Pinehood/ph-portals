import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { RedisService } from "@utils/services";
import { getPortalName } from "@resources/common/functions";
import { Portals } from "@resources/common/constants";
import { Article } from "@resources/dtos/article.dto";
import { Portal } from "@resources/dtos/portal.dto";

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
      portals.push({
        name: getPortalName(Portals[value]),
        value: Portals[value],
      });
    });
    return portals;
  }

  async getArticles(portal: Portals, withContent: boolean): Promise<Article[]> {
    try {
      const articles = JSON.parse(
        await this.redisService.get(portal)
      ) as Article[];
      if (!articles) return null;
      if (withContent) {
        return articles;
      } else {
        return articles.map((a) => {
          a.content = "...";
          return a;
        });
      }
    } catch (error: any) {
      this.logger.error(error);
      return null;
    }
  }
}
