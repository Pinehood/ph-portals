import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { default as pinoPretty } from "pino-pretty";
import { default as env } from "@/common/env";
import { validationSchema } from "@/common/env.validation";
import { ApiController, PortalsController } from "@/controllers";
import { ApiService, CronService, PortalsService } from "@/services";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [env], validationSchema }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: env().THROTTLER_TTL,
      limit: env().THROTTLER_REQ_PER_TTL,
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
    PortalsService,
    ApiService,
    CronService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
