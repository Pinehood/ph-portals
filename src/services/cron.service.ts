import { Injectable } from "@nestjs/common";
import { Cron, CronExpression, Timeout } from "@nestjs/schedule";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import {
  Portals,
  PORTAL_SCRAPERS,
  StatsKeys,
  ScraperConfig,
  TemplateNames,
  CommonConstants,
} from "@/common";
import { ScraperService } from "@/services/scraper.service";
import { PortalsService } from "@/services/portals.service";

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
      const homePage = this.portalsService.getPage(Portals.HOME);
      const homeKey = Portals.HOME + StatsKeys.PAGE_SUFFIX;
      this.portalsService.save(homeKey, homePage);
      const scrapers = Object.entries(PORTAL_SCRAPERS).map(([, value]) =>
        this.cachePortalAndArticles(value)
      );
      await Promise.all(scrapers);
      this.portalsService.save(
        StatsKeys.CACHE_MEMORY,
        this.portalsService.getCacheMemorySize(true)
      );
    } catch (error: any) {
      this.logger.error(error);
    }
  }

  private async cachePortalAndArticles(config: ScraperConfig): Promise<void> {
    try {
      const portal = config.type;
      const name = config.name;
      const start = Date.now();
      const articles = await ScraperService.scrape(config);
      for (let i = 0; i < articles.length; i++) {
        articles[i].html = this.portalsService.getFilledPageContent(
          portal,
          TemplateNames.ARTICLE,
          articles[i]
        );
      }
      const end = Date.now();
      const duration = end - start;
      this.logger.info(
        "Scraped '%d' articles from '%s'",
        articles.length,
        name
      );
      const durationKey = `${StatsKeys.TOTAL_SCRAPING_TIME_PREFIX}${portal}`;
      this.portalsService.save(durationKey, duration);
      const lastDateKey = `${StatsKeys.LAST_REFRESHED_ON_PREFIX}${portal}`;
      this.portalsService.save(lastDateKey, Date.now());
      const numArticlesKey = `${StatsKeys.TOTAL_SCRAPED_ARTICLES_PREFIX}${portal}`;
      this.portalsService.save(numArticlesKey, articles.length);
      this.portalsService.save(portal, articles);
      const portalPage =
        articles && articles.length > 0
          ? this.portalsService.getPage(portal)
          : this.portalsService.getFilledPageContent(
              portal,
              TemplateNames.PORTAL,
              {
                articles: this.portalsService.getTemplateContent(
                  TemplateNames.NO_ARTICLES
                ),
                stats: CommonConstants.NO_STATS,
                title: `Portali - ${name}`,
              }
            );
      this.portalsService.save(portal + StatsKeys.PAGE_SUFFIX, portalPage);
    } catch (error: any) {
      this.logger.error(error);
    }
  }
}
