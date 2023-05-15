import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { default as pinoPretty } from "pino-pretty";
import { ApiController, PortalsController } from "@/controllers";
import {
  ApiService,
  CronService,
  PortalsService,
  RedisService,
  ScrapeIndexService,
  ScrapeJutarnjiService,
  ScrapeNetService,
  ScrapePoslovniService,
  ScrapeSlobodnaDalmacijaService,
  ScrapeSportskeNovostiService,
  ScrapeTelegramService,
  ScrapeTportalService,
  ScrapeVecernjiService,
  ScrapeZagrebService,
} from "@/services";

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: parseInt(process.env.THROTTLER_TTL),
      limit: parseInt(process.env.THROTTLER_REQ_PER_TTL),
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        stream: pinoPretty({ colorize: true }),
        quietReqLogger: false,
        autoLogging: false,
      },
    }),
  ],
  controllers: [ApiController, PortalsController],
  providers: [
    ApiService,
    CronService,
    PortalsService,
    RedisService,
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
