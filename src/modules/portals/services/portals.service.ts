import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Article } from "@resources/dtos";
import { RedisService } from "@utils/services/redis.service";
import {
  formatDate,
  getPortalName,
  getPortalsLinks,
  millisToSeconds,
  redirect,
} from "@common/functions";
import {
  CommonConstants,
  Portals,
  RedisStatsKeys,
  ResponseConstants,
  TemplateNames,
} from "@common/constants";
import dirname from "@resources/templates";
import { join } from "path";
import * as fs from "fs";
import * as Handlebars from "handlebars";

@Injectable()
export class PortalsService {
  constructor(
    @InjectPinoLogger(PortalsService.name)
    private readonly logger: PinoLogger,
    private readonly redisService: RedisService
  ) {}

  async getCachedPage(portal: Portals): Promise<string> {
    try {
      const page = await this.redisService.get(
        portal + RedisStatsKeys.PAGE_SUFFIX
      );
      if (page) {
        return page;
      } else {
        return redirect(Portals.HOME);
      }
    } catch (error: any) {
      this.logger.error(error);
      return redirect(Portals.HOME);
    }
  }

  async getCachedArticle(portal: Portals, articleId: string): Promise<string> {
    try {
      const articles = JSON.parse(
        await this.redisService.get(portal)
      ) as Article[];
      if (!articles) return "";
      const article = articles.find((a) => a.articleId == articleId);
      if (!article) return "";
      return article.html;
    } catch (error: any) {
      this.logger.error(error);
      return redirect(portal);
    }
  }

  async getPage(portal: Portals): Promise<string> {
    try {
      if (portal == Portals.HOME) {
        return await this.getFilledPageContent(
          Portals.HOME,
          TemplateNames.HOME,
          {}
        );
      } else {
        const articles = JSON.parse(
          await this.redisService.get(portal)
        ) as Article[];
        const templateContent = await this.getTemplateContent(
          TemplateNames.ITEM,
          true
        );
        if (!articles || !templateContent) {
          return await this.getFilledPageContent(portal, TemplateNames.PORTAL, {
            articles: ResponseConstants.NO_ARTICLES,
            stats: ResponseConstants.NO_STATS,
            title: `Portali - ${getPortalName(portal)}`,
          });
        }
        let finalContent = "";
        for (let i = 0; i < articles.length; i++) {
          const article = articles[i];
          const content = await this.fillPageContent(templateContent, article);
          finalContent += content;
        }
        const duration = parseInt(
          await this.redisService.get(
            RedisStatsKeys.TOTAL_SCRAPING_TIME_PREFIX + portal
          )
        );
        const lastDate = parseInt(
          await this.redisService.get(
            RedisStatsKeys.LAST_REFRESHED_ON_PREFIX + portal
          )
        );
        const numArticles = parseInt(
          await this.redisService.get(
            RedisStatsKeys.TOTAL_SCRAPED_ARTICLES_PREFIX + portal
          )
        );
        const stats = `Članci: <strong>${numArticles}</strong> | Obrada: <strong>${millisToSeconds(
          duration
        )}</strong>  | Osvježeno: <strong>${formatDate(
          new Date(lastDate),
          true
        )}</strong> `;
        return await this.getFilledPageContent(portal, TemplateNames.PORTAL, {
          articles: finalContent,
          stats,
          title: `Portali - ${getPortalName(portal)}`,
        });
      }
    } catch (error: any) {
      this.logger.error(error);
      return redirect(Portals.HOME);
    }
  }

  async getArticle(portal: Portals, articleId: string): Promise<string> {
    try {
      const articles = JSON.parse(
        await this.redisService.get(portal)
      ) as Article[];
      if (!articles) return "";
      const article = articles.find((a) => a.articleId == articleId);
      if (!article) return "";
      const content = await this.getFilledPageContent(
        portal,
        TemplateNames.ARTICLE,
        article
      );
      return content;
    } catch (error: any) {
      this.logger.error(error);
      return redirect(portal);
    }
  }

  async getTemplateContent(
    template: TemplateNames,
    redis?: boolean
  ): Promise<string> {
    try {
      if (redis == true) {
        return await this.redisService.get(template);
      } else {
        const path = join(dirname(), template);
        const content = fs.readFileSync(path, {
          encoding: CommonConstants.UTF_8,
        });
        return content;
      }
    } catch (error: any) {
      this.logger.error(error);
      return error;
    }
  }

  async fillPageContent(content: string, data: any): Promise<string> {
    try {
      const template = Handlebars.compile(content, {
        noEscape: true,
        strict: false,
      });
      const result = template(data);
      return result;
    } catch (error: any) {
      this.logger.error(error);
      return error;
    }
  }

  async getFilledPageContent(
    portal: Portals,
    templateName: TemplateNames,
    data: any
  ): Promise<string> {
    try {
      const links = getPortalsLinks(portal);
      const content = await this.getTemplateContent(templateName, true); //TODO: fix caching issues
      const template = Handlebars.compile(content, {
        noEscape: true,
        strict: false,
      });
      const result = template({ links, ...data });
      return result;
    } catch (error: any) {
      this.logger.error(error);
      return error;
    }
  }
}
