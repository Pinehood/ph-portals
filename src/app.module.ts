import { Module } from "@nestjs/common";
import { SeqLoggerModule } from "@jasonsoft/nestjs-seq";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { default as env, validationSchema } from "@/common/env";
import { ApiController, PortalsController } from "@/controllers";
import { ApiService, CronService, PortalsService } from "@/services";
import { AIService } from "./services/ai.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [env], validationSchema }),
    SeqLoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          serverUrl: configService.get("SEQ_SERVER_URL"),
          apiKey: configService.get("SEQ_API_KEY"),
          extendMetaProperties: {
            serviceName: configService.get("SEQ_SERVICE_NAME"),
          },
        };
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: env().THROTTLER_TTL,
          limit: env().THROTTLER_REQ_PER_TTL,
        },
      ],
    }),
  ],
  controllers: [ApiController, PortalsController],
  providers: [
    PortalsService,
    ApiService,
    AIService,
    CronService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
