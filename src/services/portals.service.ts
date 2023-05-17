import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { join } from "path";
import * as fs from "fs";
import * as Handlebars from "handlebars";
import { Article, ScraperStats } from "@/dtos";
import {
  CommonConstants,
  formatDate,
  getPortalName,
  getPortalsLinks,
  millisToSeconds,
  Portals,
  redirect,
  RedisStatsKeys,
  ResponseConstants,
  TemplateNames,
} from "@/common";
import dirname from "@/templates";

const CACHE_MAP = new Map<string, any>();

@Injectable()
export class PortalsService {
  constructor(
    @InjectPinoLogger(PortalsService.name)
    private readonly logger: PinoLogger
  ) {}

  getCachedPage(portal: Portals): string {
    try {
      const key = `${portal}${RedisStatsKeys.PAGE_SUFFIX}`;
      const page = CACHE_MAP.get(key) as string;
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

  getCachedArticle(portal: Portals, articleId: string): string {
    try {
      const articles = CACHE_MAP.get(portal) as Article[];
      if (!articles) return "";
      const article = articles.find((a) => a.articleId == articleId);
      if (!article) return "";
      return article.html;
    } catch (error: any) {
      this.logger.error(error);
      return redirect(portal);
    }
  }

  getPage(portal: Portals): string {
    try {
      if (portal == Portals.HOME) {
        return this.getFilledPageContent(Portals.HOME, TemplateNames.HOME, {});
      } else {
        const articles = CACHE_MAP.get(portal) as Article[];
        const templateContent = this.getTemplateContent(
          TemplateNames.ITEM,
          true
        );
        if (!articles || !templateContent) {
          return this.getFilledPageContent(portal, TemplateNames.PORTAL, {
            articles: ResponseConstants.NO_ARTICLES,
            stats: ResponseConstants.NO_STATS,
            title: `Portali - ${getPortalName(portal)}`,
          });
        }
        let finalContent = "";
        for (let i = 0; i < articles.length; i++) {
          const article = articles[i];
          const content = this.fillPageContent(templateContent, article);
          finalContent += content;
        }
        const durationKey = `${RedisStatsKeys.TOTAL_SCRAPING_TIME_PREFIX}${portal}`;
        const duration = parseInt(CACHE_MAP.get(durationKey));
        const lastDateKey = `${RedisStatsKeys.LAST_REFRESHED_ON_PREFIX}${portal}`;
        const lastDate = parseInt(CACHE_MAP.get(lastDateKey));
        const numArticlesKey = `${RedisStatsKeys.TOTAL_SCRAPED_ARTICLES_PREFIX}${portal}`;
        const numArticles = parseInt(CACHE_MAP.get(numArticlesKey));
        const stats = `Članci: <strong>${numArticles}</strong> | Obrada: <strong>${millisToSeconds(
          duration
        )}</strong>  | Osvježeno: <strong>${formatDate(
          new Date(lastDate),
          true
        )}</strong> `;
        return this.getFilledPageContent(portal, TemplateNames.PORTAL, {
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

  getArticle(portal: Portals, articleId: string): string {
    try {
      const articles = CACHE_MAP.get(portal) as Article[];
      if (!articles) return "";
      const article = articles.find((a) => a.articleId == articleId);
      if (!article) return "";
      const content = this.getFilledPageContent(
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

  getTemplateContent(template: TemplateNames, cache?: boolean): string {
    try {
      if (cache == true) {
        return CACHE_MAP.get(template) as string;
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

  fillPageContent(content: string, data: any): string {
    try {
      const template = Handlebars.compile(content, {
        noEscape: true,
        strict: false,
      });
      return template(data);
    } catch (error: any) {
      this.logger.error(error);
      return error;
    }
  }

  getFilledPageContent(
    portal: Portals,
    templateName: TemplateNames,
    data: any
  ): string {
    try {
      const links = getPortalsLinks(portal);
      let content = this.getTemplateContent(templateName, true);
      if (!content) {
        content = this.getTemplateContent(templateName);
      }
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

  save(key: string, value: any): void {
    CACHE_MAP.set(key, value);
  }

  get(key: string): any {
    return CACHE_MAP.get(key);
  }

  getArticles(portal: Portals): Article[] {
    return CACHE_MAP.get(portal) as Article[];
  }

  getStats(portal: Portals): ScraperStats {
    const durationKey = `${RedisStatsKeys.TOTAL_SCRAPING_TIME_PREFIX}${portal}`;
    const lastDateKey = `${RedisStatsKeys.LAST_REFRESHED_ON_PREFIX}${portal}`;
    const numArticlesKey = `${RedisStatsKeys.TOTAL_SCRAPED_ARTICLES_PREFIX}${portal}`;
    return {
      articles: parseInt(CACHE_MAP.get(numArticlesKey)),
      date: parseInt(CACHE_MAP.get(lastDateKey)),
      duration: parseInt(CACHE_MAP.get(durationKey)),
    };
  }
}
