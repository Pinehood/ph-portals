import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import { default as env } from "@/common/env";
import { AppModule } from "@/app.module";
import { CommonConstants, SwaggerConstants } from "@/common";

export const setupApp = async () => {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableCors({ origin: "*" });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useLogger(app.get(Logger));
  return app;
};

export const setupSwagger = async (app: INestApplication) => {
  const options = new DocumentBuilder()
    .setTitle(SwaggerConstants.TITLE)
    .setDescription(SwaggerConstants.DESCRIPTION)
    .setVersion(SwaggerConstants.VERSION)
    .build();

  if (env().SWAGGER_USE_METADATA_FILE === true) {
    const imp = await import(SwaggerConstants.METADATA);
    const def = (await imp.default()) as Record<string, any>;
    await SwaggerModule.loadPluginMetadata(async () => def);
  }
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(SwaggerConstants.URL, app, document);
};

export const start = async (app: INestApplication) =>
  await app.listen(CommonConstants.LISTEN_PORT);
