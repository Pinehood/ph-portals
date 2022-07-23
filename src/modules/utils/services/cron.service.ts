import { Injectable } from "@nestjs/common";
import { Cron, CronExpression, Timeout } from "@nestjs/schedule";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { TemplateNames } from "@common/constants";
import { TemplateContentService } from "@portals/services/template-content.service";
import { RedisService } from "@utils/services/redis.service";

@Injectable()
export class CronService {
  constructor(
    @InjectPinoLogger(CronService.name) private readonly logger: PinoLogger,
    private readonly redisService: RedisService,
    private readonly templateContentService: TemplateContentService
  ) {}

  @Timeout(2000)
  loadAll(): void {
    this.loadTemplatesContent();
    this.scrapeData();
  }

  @Cron(CronExpression.EVERY_HOUR)
  private async scrapeData(): Promise<void> {
    try {
      this.logger.info("Scrape data");
    } catch (error: any) {
      this.logger.error(error);
    }
  }

  private loadTemplatesContent(): void {
    try {
      Object.keys(TemplateNames).forEach(async (value) => {
        const content = await this.templateContentService.getTemplateContent(
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
