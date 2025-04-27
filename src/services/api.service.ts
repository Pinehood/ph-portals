import * as cheerio from "cheerio";
import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Article, ArticleInfo, Portal, ScraperStats } from "@/dtos";
import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";
import {
  MAX_DEFAULT_ARTICLE_LIMIT,
  MAX_STR_POST_LENGTH,
  PORTAL_SCRAPERS,
} from "@/common/constants";
import { PortalsService } from "@/services/portals.service";
import { AIService } from "./ai.service";

@Injectable()
export class ApiService {
  constructor(
    @InjectPinoLogger(ApiService.name)
    private readonly logger: PinoLogger,
    private readonly portalsService: PortalsService,
    private readonly aiService: AIService,
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

  getArticles(portal: Portals, withContent: boolean): ArticleInfo[] {
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
        if (!!stats?.articles && !!stats?.duration) {
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

  promptOpenAI(prompt: string): Promise<string> {
    try {
      return this.aiService.getResponse(this.getDataForOpenAI(), prompt);
    } catch (error: any) {
      this.logger.error(error);
      return null;
    }
  }

  private getDataForOpenAI(limit = MAX_DEFAULT_ARTICLE_LIMIT): string {
    try {
      const array: string[] = [];
      const keys = Object.keys(PORTAL_SCRAPERS).slice(1);
      for (const portal of keys) {
        const articles = this.getArticles(portal as Portals, true);
        if (articles?.length) {
          array.push(
            ...articles
              .slice(0, limit > -1 ? limit : undefined)
              .map((a) =>
                `${a.title}:${this.stripHtml(a.content)}`.substring(
                  0,
                  MAX_STR_POST_LENGTH,
                ),
              ),
          );
        }
      }
      return array.join("\n");
    } catch (error: any) {
      this.logger.error(error);
      return null;
    }
  }

  private articleToArticleInfo(
    article: Article,
    withContent: boolean,
  ): ArticleInfo {
    return {
      articleId: article.articleId,
      articleLink: article.articleLink,
      author: article.author,
      content: withContent == true ? article.content : "(...)",
      lead: article.lead,
      portalLink: article.portalLink,
      portalName: article.portalName,
      time: article.time,
      title: article.title,
    };
  }

  private stripHtml(content: string): string {
    try {
      const $ = cheerio.load(content);
      return $.text().replace(/\#/g, "");
    } catch {
      return content;
    }
  }
}
