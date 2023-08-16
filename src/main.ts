import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import { AppModule } from "@/app.module";
import { CommonConstants, SwaggerConstants } from "@/common";

(async function () {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableCors({ origin: "*" });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useLogger(app.get(Logger));

  const options = new DocumentBuilder()
    .setTitle(SwaggerConstants.TITLE)
    .setDescription(SwaggerConstants.DESCRIPTION)
    .setVersion(SwaggerConstants.VERSION)
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(SwaggerConstants.URL, app, document);

  await app.listen(CommonConstants.LISTEN_PORT);
})();
