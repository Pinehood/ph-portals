import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { RedisService } from "@utils/services";

@Injectable()
export class CronService {
  constructor(
    @InjectPinoLogger(CronService.name) private readonly logger: PinoLogger,
    private readonly redisService: RedisService
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async scrapData(): Promise<void> {
    try {
      await this.redisService.keyExists("test");
    } catch (error: any) {
      this.logger.error(error);
    }
  }
}
