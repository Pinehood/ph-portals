import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import {
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
} from "@scrapers/services";
import { UtilsModule } from "@utils/utils.module";
import { PortalsModule } from "@portals/portals.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    forwardRef(() => UtilsModule),
    forwardRef(() => PortalsModule),
  ],
  providers: [
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
  ],
  exports: [
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
  ],
})
export class ScrapersModule {}
