import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Article } from "@resources/dtos";
import { RedisService } from "@utils/services/redis.service";
import { getPortalsLinks } from "@resources/common/functions";
import {
  CommonConstants,
  Portals,
  TemplateNames,
} from "@resources/common/constants";
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
            articles: "<p>Nema članaka za prikaz.</p>",
          });
        }
        let finalContent = "";
        for (let i = 0; i < articles.length; i++) {
          const article = articles[i];
          const content = await this.fillPageContent(templateContent, article);
          finalContent += content;
        }
        return await this.getFilledPageContent(portal, TemplateNames.PORTAL, {
          articles: finalContent,
        });
      }
    } catch (error: any) {
      this.logger.error(error);
      return "";
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
      return "";
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
      return "";
    }
  }

  private async fillPageContent(content: string, data: any): Promise<string> {
    try {
      const template = Handlebars.compile(content, {
        noEscape: true,
        strict: false,
      });
      const result = template(data);
      return result;
    } catch (error: any) {
      this.logger.error(error);
      return "";
    }
  }

  private async getFilledPageContent(
    portal: Portals,
    templateName: TemplateNames,
    data: any
  ): Promise<string> {
    try {
      const links = getPortalsLinks(portal);
      const content = await this.getTemplateContent(templateName, true);
      const template = Handlebars.compile(content, {
        noEscape: true,
        strict: false,
      });
      const result = template({ links, ...data });
      return result;
    } catch (error: any) {
      this.logger.error(error);
      return "";
    }
  }
}
