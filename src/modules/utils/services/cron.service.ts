import { Injectable } from "@nestjs/common";
import { Cron, CronExpression, Timeout } from "@nestjs/schedule";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Portals, TemplateNames } from "@resources/common/constants";
import { PortalsService } from "@portals/services/portals.service";
import { RedisService } from "@utils/services/redis.service";
import { Scrape24SataService } from "@scrapers/services";

@Injectable()
export class CronService {
  constructor(
    @InjectPinoLogger(CronService.name) private readonly logger: PinoLogger,
    private readonly redisService: RedisService,
    private readonly portalsService: PortalsService,
    private readonly scrape24SataService: Scrape24SataService
  ) {}

  @Timeout(2000)
  loadAll(): void {
    this.loadTemplatesContent();
    this.scrapeData();
  }

  @Cron(CronExpression.EVERY_HOUR)
  private async scrapeData(): Promise<void> {
    try {
      const articles24h = await this.scrape24SataService.scrape();
      await this.redisService.set(Portals.SATA24, JSON.stringify(articles24h));
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
}
