import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { join } from "path";
import * as fs from "fs";
import * as Handlebars from "handlebars";
import { Article, ScraperStats } from "@/dtos";
import {
  CommonConstants,
  formatDate,
  GTAG_HTML,
  millisToSeconds,
  Portals,
  PORTAL_SCRAPERS,
  ScraperConfig,
  StatsKeys,
  TemplateNames,
  TokenizedConstants,
  Tokens,
} from "@/common";
import dirname from "@/templates";

const CACHE_MAP = new Map<string, any>();

@Injectable()
export class PortalsService {
  constructor(
    @InjectPinoLogger(PortalsService.name)
    private readonly logger: PinoLogger
  ) {}

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
    const durationKey = `${StatsKeys.TOTAL_SCRAPING_TIME_PREFIX}${portal}`;
    const lastDateKey = `${StatsKeys.LAST_REFRESHED_ON_PREFIX}${portal}`;
    const numArticlesKey = `${StatsKeys.TOTAL_SCRAPED_ARTICLES_PREFIX}${portal}`;
    return {
      articles: parseInt(CACHE_MAP.get(numArticlesKey), 10),
      date: parseInt(CACHE_MAP.get(lastDateKey), 10),
      duration: parseInt(CACHE_MAP.get(durationKey), 10),
    };
  }

  getCachedPage(portal: Portals): string {
    try {
      const key = `${portal}${StatsKeys.PAGE_SUFFIX}`;
      const page = CACHE_MAP.get(key) as string;
      if (page) {
        return page;
      } else {
        return this.redirect(Portals.HOME);
      }
    } catch (error: any) {
      this.logger.error(error);
      return this.redirect(Portals.HOME);
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
      return this.redirect(portal);
    }
  }

  getPage(portal: Portals): string {
    try {
      const gtag =
        process.env.NODE_ENV == CommonConstants.PROD_ENV
          ? GTAG_HTML.replace(
              new RegExp(Tokens.GOOGLE_TAG_ID, "g"),
              process.env.GOOGLE_ANALYTICS_TAG
            )
          : "<br/>";
      if (portal == Portals.HOME) {
        return this.getFilledPageContent(Portals.HOME, TemplateNames.HOME, {
          ga: gtag,
        });
      } else {
        const ps = PORTAL_SCRAPERS[portal] as any;
        const articles = CACHE_MAP.get(portal) as Article[];
        const templateContent = this.getTemplateContent(
          TemplateNames.ITEM,
          true
        );
        if (!articles || !templateContent) {
          return this.getFilledPageContent(portal, TemplateNames.PORTAL, {
            articles: TokenizedConstants.NO_ARTICLES,
            stats: TokenizedConstants.NO_STATS,
            title: `Portali - ${ps.name}`,
            ga: gtag,
          });
        }
        let finalContent = "";
        for (let i = 0; i < articles.length; i++) {
          const article = articles[i];
          const content = this.fillPageContent(templateContent, article);
          finalContent += content;
        }
        const durationKey = `${StatsKeys.TOTAL_SCRAPING_TIME_PREFIX}${portal}`;
        const duration = parseInt(CACHE_MAP.get(durationKey), 10);
        const lastDateKey = `${StatsKeys.LAST_REFRESHED_ON_PREFIX}${portal}`;
        const lastDate = parseInt(CACHE_MAP.get(lastDateKey), 10);
        const numArticlesKey = `${StatsKeys.TOTAL_SCRAPED_ARTICLES_PREFIX}${portal}`;
        const numArticles = parseInt(CACHE_MAP.get(numArticlesKey), 10);
        const stats = TokenizedConstants.STATS.replace(
          Tokens.NUMBER,
          "" + numArticles
        )
          .replace(Tokens.DURATION, millisToSeconds(duration))
          .replace(Tokens.DATE, formatDate(new Date(lastDate), true));
        return this.getFilledPageContent(portal, TemplateNames.PORTAL, {
          articles: finalContent,
          stats,
          title: `Portali - ${ps.name}`,
          ga: gtag,
        });
      }
    } catch (error: any) {
      this.logger.error(error);
      return this.redirect(Portals.HOME);
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

  getFilledPageContent(
    portal: Portals,
    templateName: TemplateNames,
    data: any
  ): string {
    try {
      const links = this.getPortalsLinks(portal);
      let content = this.getTemplateContent(templateName, true);
      if (!content) {
        content = this.getTemplateContent(templateName);
      }
      return this.fillPageContent(content, { links, ...data });
    } catch (error: any) {
      this.logger.error(error);
      return error;
    }
  }

  private fillPageContent(content: string, data: any): string {
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

  private redirect(portal: Portals): string {
    try {
      return TokenizedConstants.REDIRECT.replace(
        Tokens.REDIRECT_URL,
        `/portals/${portal}`
      );
    } catch {
      return `/portals/home`;
    }
  }

  private getPortalsLinks(portal: Portals): string {
    try {
      let linksHtml = "";
      Object.keys(Portals).forEach((value) => {
        const po = Portals[value];
        const psc = PORTAL_SCRAPERS[po] as ScraperConfig;
        let linkHtml = TokenizedConstants.LINK.replace(Tokens.PORTAL, po)
          .replace(
            Tokens.LINK,
            po == Portals.HOME ? CommonConstants.HOME_ICON : psc.icon
          )
          .replace(
            Tokens.NAME,
            po == Portals.HOME ? CommonConstants.HOME_NAME : psc.name
          );
        if (po == portal) {
          linkHtml = linkHtml.replace(Tokens.ACTIVE, "active ");
        } else {
          linkHtml = linkHtml.replace(Tokens.ACTIVE, "");
        }
        linksHtml += linkHtml;
      });
      return linksHtml;
    } catch (error: any) {
      this.logger.error(error);
      return "";
    }
  }
}
