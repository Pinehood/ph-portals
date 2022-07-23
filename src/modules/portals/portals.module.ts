import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PortalsController } from "@portals/controllers";
import { TemplateContentService } from "@portals/services";
import { ScrapersModule } from "@scrapers/scrapers.module";
import { UtilsModule } from "@utils/utils.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    forwardRef(() => ScrapersModule),
    forwardRef(() => UtilsModule),
  ],
  controllers: [PortalsController],
  providers: [TemplateContentService],
  exports: [TemplateContentService],
})
export class PortalsModule {}
