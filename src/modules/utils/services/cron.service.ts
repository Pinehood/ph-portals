import { Injectable } from "@nestjs/common";
import { Cron, CronExpression, Timeout } from "@nestjs/schedule";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import {
  Portals,
  RedisStatsKeys,
  ResponseConstants,
  TemplateNames,
} from "@resources/common/constants";
import { PortalsService } from "@portals/services/portals.service";
import { RedisService } from "@utils/services/redis.service";
import {
  Scrape24SataService,
  ScrapeDnevnikService,
  ScrapeDnevnoService,
  ScrapeIndexService,
  ScrapeJutarnjiService,
  ScrapeNetService,
  ScraperService,
  ScrapeSlobodnaDalmacijaService,
  ScrapeSportskeNovostiService,
  ScrapeTportalService,
  ScrapeVecernjiService,
} from "@scrapers/services";
import { getPortalName } from "@resources/common";

@Injectable()
export class CronService {
  constructor(
    @InjectPinoLogger(CronService.name) private readonly logger: PinoLogger,
    private readonly redisService: RedisService,
    private readonly portalsService: PortalsService,
    private readonly scrape24SataService: Scrape24SataService,
    private readonly scrapeDnevnikService: ScrapeDnevnikService,
    private readonly scrapeDnevnoService: ScrapeDnevnoService,
    private readonly scrapeIndexService: ScrapeIndexService,
    private readonly scrapeJutarnjiService: ScrapeJutarnjiService,
    private readonly scrapeNetService: ScrapeNetService,
    private readonly scrapeSlobodnaDalmacijaService: ScrapeSlobodnaDalmacijaService,
    private readonly scrapeSportskeNovostiService: ScrapeSportskeNovostiService,
    private readonly scrapeTportalService: ScrapeTportalService,
    private readonly scrapeVecernjiService: ScrapeVecernjiService
  ) {}

  @Timeout(2000)
  loadAll(): void {
    this.loadTemplatesContent();
    this.scrapeData();
  }

  @Cron(CronExpression.EVERY_HOUR)
  private async scrapeData(): Promise<void> {
    try {
      const portalPage = await this.portalsService.getPage(Portals.HOME);
      await this.redisService.set(Portals.HOME + "page", portalPage);
      await Promise.all([
        this.cachePortalAndArticles(this.scrape24SataService),
        this.cachePortalAndArticles(this.scrapeDnevnikService),
        this.cachePortalAndArticles(this.scrapeDnevnoService),
        this.cachePortalAndArticles(this.scrapeIndexService),
        this.cachePortalAndArticles(this.scrapeJutarnjiService),
        this.cachePortalAndArticles(this.scrapeNetService),
        this.cachePortalAndArticles(this.scrapeSlobodnaDalmacijaService),
        this.cachePortalAndArticles(this.scrapeSportskeNovostiService),
        this.cachePortalAndArticles(this.scrapeTportalService),
        this.cachePortalAndArticles(this.scrapeVecernjiService),
      ]);
    } catch (error: any) {
      this.logger.error(error);
    }
  }

  private loadTemplatesContent(): void {
    try {
      Object.keys(TemplateNames).forEach(async (value) => {
        const content = await this.portalsService.getTemplateContent(
          TemplateNames[value]
        );
        await this.redisService.set(TemplateNames[value], content);
      });
      this.logger.info("Preloaded all templates' HTML content");
    } catch (error: any) {
      this.logger.error(error);
    }
  }

  private async cachePortalAndArticles(service: ScraperService): Promise<void> {
    try {
      const start = Date.now();
      const articles = await service.scrape();
      for (let i = 0; i < articles.length; i++) {
        articles[i].html = await this.portalsService.getFilledPageContent(
          service.type,
          TemplateNames.ARTICLE,
          articles[i]
        );
      }
      const end = Date.now();
      const duration = end - start;
      await this.redisService.set(
        RedisStatsKeys.LAST_REFRESHED_ON_PREFIX + service.type,
        Date.now()
      );
      await this.redisService.set(
        RedisStatsKeys.TOTAL_SCRAPED_ARTICLES_PREFIX + service.type,
        articles.length
      );
      await this.redisService.set(
        RedisStatsKeys.TOTAL_SCRAPING_TIME_PREFIX + service.type,
        duration
      );
      await this.redisService.set(service.type, JSON.stringify(articles));
      const portalPage =
        articles && articles.length > 0
          ? await this.portalsService.getPage(service.type)
          : await this.portalsService.getFilledPageContent(
              service.type,
              TemplateNames.PORTAL,
              {
                articles: ResponseConstants.NO_ARTICLES,
                stats: ResponseConstants.NO_STATS,
                title: `Portali - ${getPortalName(service.type)}`,
              }
            );
      await this.redisService.set(service.type + "page", portalPage);
    } catch (error: any) {
      this.logger.error(error);
    }
  }
}
