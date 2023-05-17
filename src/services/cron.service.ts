import { Injectable } from "@nestjs/common";
import { Cron, CronExpression, Timeout } from "@nestjs/schedule";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import {
  getPortalName,
  Portals,
  RedisStatsKeys,
  ResponseConstants,
  ScraperConfig,
  ScraperService,
  TemplateNames,
} from "@/common";
import {
  Scrape24SataConfig,
  ScrapeDanasConfig,
  ScrapeDirektnoConfig,
  ScrapeDnevnikConfig,
  ScrapeDnevnoConfig,
} from "@/configs";
import { PortalsService } from "@/services/portals.service";
import {
  ConfiguredScraperService,
  ScrapeIndexService,
  ScrapeJutarnjiService,
  ScrapeNetService,
  ScrapePoslovniService,
  ScrapeSlobodnaDalmacijaService,
  ScrapeSportskeNovostiService,
  ScrapeTportalService,
  ScrapeVecernjiService,
  ScrapeZagrebService,
  ScrapeTelegramService,
} from "@/services";

@Injectable()
export class CronService {
  constructor(
    @InjectPinoLogger(CronService.name) private readonly logger: PinoLogger,
    private readonly portalsService: PortalsService
  ) {}

  @Timeout(2000)
  loadTemplatesContent(): void {
    try {
      Object.keys(TemplateNames).forEach((value) =>
        this.portalsService.save(
          TemplateNames[value],
          this.portalsService.getTemplateContent(TemplateNames[value])
        )
      );
      this.logger.info("Preloaded all templates' HTML content");
      this.scrapeData();
    } catch (error: any) {
      this.logger.error(error);
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async scrapeData(): Promise<void> {
    try {
      const portalPage = this.portalsService.getPage(Portals.HOME);
      this.portalsService.save(
        Portals.HOME + RedisStatsKeys.PAGE_SUFFIX,
        portalPage
      );
      await Promise.all([
        this.cachePortalAndArticlesEx(Scrape24SataConfig),
        this.cachePortalAndArticlesEx(ScrapeDanasConfig),
        this.cachePortalAndArticlesEx(ScrapeDirektnoConfig),
        this.cachePortalAndArticlesEx(ScrapeDnevnikConfig),
        this.cachePortalAndArticlesEx(ScrapeDnevnoConfig),
        this.cachePortalAndArticles(new ScrapeIndexService()),
        this.cachePortalAndArticles(new ScrapeJutarnjiService()),
        this.cachePortalAndArticles(new ScrapeNetService()),
        this.cachePortalAndArticles(new ScrapePoslovniService()),
        this.cachePortalAndArticles(new ScrapeSlobodnaDalmacijaService()),
        this.cachePortalAndArticles(new ScrapeSportskeNovostiService()),
        this.cachePortalAndArticles(new ScrapeTportalService()),
        this.cachePortalAndArticles(new ScrapeVecernjiService()),
        this.cachePortalAndArticles(new ScrapeZagrebService()),
        this.cachePortalAndArticles(new ScrapeTelegramService()),
      ]);
    } catch (error: any) {
      this.logger.error(error);
    }
  }

  private async cachePortalAndArticlesEx(config: ScraperConfig): Promise<void> {
    try {
      const start = Date.now();
      const articles = await ConfiguredScraperService.scrape(config);
      for (let i = 0; i < articles.length; i++) {
        articles[i].html = this.portalsService.getFilledPageContent(
          config.type,
          TemplateNames.ARTICLE,
          articles[i]
        );
      }
      const end = Date.now();
      const duration = end - start;
      this.logger.info(
        "Scraped '%d' articles from '%s'",
        articles.length,
        config.name
      );
      this.portalsService.save(
        RedisStatsKeys.LAST_REFRESHED_ON_PREFIX + config.type,
        Date.now()
      );
      this.portalsService.save(
        RedisStatsKeys.TOTAL_SCRAPED_ARTICLES_PREFIX + config.type,
        articles.length
      );
      this.portalsService.save(
        RedisStatsKeys.TOTAL_SCRAPING_TIME_PREFIX + config.type,
        duration
      );
      this.portalsService.save(config.type, articles);
      const portalPage =
        articles && articles.length > 0
          ? this.portalsService.getPage(config.type)
          : this.portalsService.getFilledPageContent(
              config.type,
              TemplateNames.PORTAL,
              {
                articles: ResponseConstants.NO_ARTICLES,
                stats: ResponseConstants.NO_STATS,
                title: `Portali - ${getPortalName(config.type)}`,
              }
            );
      this.portalsService.save(
        config.type + RedisStatsKeys.PAGE_SUFFIX,
        portalPage
      );
    } catch (error: any) {
      this.logger.error(error);
    }
  }

  private async cachePortalAndArticles(service: ScraperService): Promise<void> {
    try {
      const start = Date.now();
      const articles = await service.scrape();
      for (let i = 0; i < articles.length; i++) {
        articles[i].html = this.portalsService.getFilledPageContent(
          service.type,
          TemplateNames.ARTICLE,
          articles[i]
        );
      }
      const end = Date.now();
      const duration = end - start;
      this.portalsService.save(
        RedisStatsKeys.LAST_REFRESHED_ON_PREFIX + service.type,
        Date.now()
      );
      this.logger.info(
        "Scraped '%d' articles from '%s'",
        articles.length,
        service.name
      );
      this.portalsService.save(
        RedisStatsKeys.TOTAL_SCRAPED_ARTICLES_PREFIX + service.type,
        articles.length
      );
      this.portalsService.save(
        RedisStatsKeys.TOTAL_SCRAPING_TIME_PREFIX + service.type,
        duration
      );
      this.portalsService.save(service.type, articles);
      const portalPage =
        articles && articles.length > 0
          ? this.portalsService.getPage(service.type)
          : this.portalsService.getFilledPageContent(
              service.type,
              TemplateNames.PORTAL,
              {
                articles: ResponseConstants.NO_ARTICLES,
                stats: ResponseConstants.NO_STATS,
                title: `Portali - ${getPortalName(service.type)}`,
              }
            );
      this.portalsService.save(
        service.type + RedisStatsKeys.PAGE_SUFFIX,
        portalPage
      );
    } catch (error: any) {
      this.logger.error(error);
    }
  }
}
