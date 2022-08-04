import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { RedisService } from "@utils/services/redis.service";
import {
  Article,
  CommonConstants,
  Portals,
  TemplateNames,
} from "@modules/common";
import dirname from "@modules/resources";
import { join } from "path";
import * as fs from "fs";
import * as Handlebars from "handlebars";

@Injectable()
export class TemplateContentService {
  constructor(
    @InjectPinoLogger(TemplateContentService.name)
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
      const links = this.getPortalsLinks(portal);
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

  private getPortalsLinks(portal: Portals): string {
    try {
      const linkTemplateHtml = `<a href="/portals/@portal@" class="@active@item">@name@</a>`;
      let linksHtml = "";
      Object.keys(Portals).forEach((value) => {
        let linkHtml = linkTemplateHtml
          .replace("@portal@", Portals[value])
          .replace("@name@", this.getPortalName(Portals[value]));
        if (Portals[value] == portal) {
          linkHtml = linkHtml.replace("@active@", "active ");
        } else {
          linkHtml = linkHtml.replace("@active@", "");
        }
        linksHtml += linkHtml;
      });
      return linksHtml;
    } catch (error: any) {
      this.logger.error(error);
      return "";
    }
  }

  private getPortalName(portal: Portals): string {
    if (portal == Portals.HOME) return "Početna";
    else if (portal == Portals.SATA24) return "24sata";
    else if (portal == Portals.INDEX) return "Index";
    else if (portal == Portals.VECERNJI) return "Večernji";
    else if (portal == Portals.JUTARNJI) return "Jutarnji";
    else if (portal == Portals.NET) return "Net";
    else if (portal == Portals.DNEVNIK) return "Dnevnik";
    else if (portal == Portals.DNEVNO) return "Dnevno";
    else if (portal == Portals.TPORTAL) return "Tportal";
    else if (portal == Portals.SLOBODNA_DALMACIJA) return "Slobodna Dalmacija";
    else if (portal == Portals.SPORTSKE_NOVOSTI) return "Sportske Novosti";
    else return "";
  }
}
