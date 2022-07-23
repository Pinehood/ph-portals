import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import { AppModule } from "@root/app.module";
import {
  CommonConstants,
  ControllerTags,
  SwaggerConstants,
} from "@modules/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableCors({
    credentials: true,
    origin: "*",
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(app.get(Logger));
  if (process.env.NODE_ENV !== CommonConstants.PRODUCTION_MODE) {
    const options = new DocumentBuilder()
      .setTitle(SwaggerConstants.TITLE)
      .setDescription(SwaggerConstants.DESCRIPTION)
      .setVersion(SwaggerConstants.VERSION)
      .addTag(ControllerTags.PORTALS)
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(SwaggerConstants.URL, app, document);
  }
  await app.listen(CommonConstants.LISTEN_PORT);
}
bootstrap();
