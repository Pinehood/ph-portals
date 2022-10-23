import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { default as pinoPretty } from "pino-pretty";
import { PortalsModule } from "@portals/portals.module";
import { ScrapersModule } from "@scrapers/scrapers.module";
import { UtilsModule } from "@utils/utils.module";

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
    PortalsModule,
    ScrapersModule,
    UtilsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
