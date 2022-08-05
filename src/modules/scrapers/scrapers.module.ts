import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Scrape24SataService, ScrapeIndexService } from "@scrapers/services";
import { UtilsModule } from "@utils/utils.module";
import { PortalsModule } from "@portals/portals.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    forwardRef(() => UtilsModule),
    forwardRef(() => PortalsModule),
  ],
  providers: [Scrape24SataService, ScrapeIndexService],
  exports: [Scrape24SataService, ScrapeIndexService],
})
export class ScrapersModule {}
