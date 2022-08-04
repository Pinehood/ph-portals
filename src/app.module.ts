import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import { LoggerModule } from "nestjs-pino";
import { default as pinoPretty } from "pino-pretty";
import * as pinoElasticSearch from "pino-elasticsearch";
import { CommonConstants, ElasticConstants, PinoMode } from "@resources/common";
import { PortalsModule } from "@portals/portals.module";
import { ScrapersModule } from "@scrapers/scrapers.module";
import { UtilsModule } from "@utils/utils.module";

const setupLoggerStream = (): any => {
  const local = pinoPretty({ colorize: true });
  const elastic = pinoElasticSearch({
    index: process.env.ELASTICSEARCH_INDEX,
    consistency: ElasticConstants.DEFAULT_CONSISTENCY,
    node: process.env.ELASTICSEARCH_URL,
    auth: {
      username: process.env.ELASTICSEARCH_USERNAME,
      password: process.env.ELASTICSEARCH_PASSWORD,
    },
    "es-version": ElasticConstants.TEMPLATE_VERSION,
    "flush-bytes": ElasticConstants.FLUSH_BYTES,
  });

  if (process.env.PINO_MODE === PinoMode.LOCAL) {
    return local;
  } else if (process.env.PINO_MODE === PinoMode.ELASTIC) {
    return elastic;
  }
};

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
        stream: setupLoggerStream(),
        quietReqLogger:
          process.env.HTTP_REQUEST_LOGGING !== CommonConstants.TRUE_STRING,
        autoLogging: false,
      },
    }),
    PrometheusModule.register(),
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
