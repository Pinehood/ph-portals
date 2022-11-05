import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import {
  Scrape24SataService,
  ScrapeDanasService,
  ScrapeDirektnoService,
  ScrapeDnevnikService,
  ScrapeDnevnoService,
  ScrapeIndexService,
  ScrapeJutarnjiService,
  ScrapeNetService,
  ScrapePoslovniService,
  ScrapeSlobodnaDalmacijaService,
  ScrapeSportskeNovostiService,
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
    Scrape24SataService,
    ScrapeDanasService,
    ScrapeDirektnoService,
    ScrapeDnevnikService,
    ScrapeDnevnoService,
    ScrapeIndexService,
    ScrapeJutarnjiService,
    ScrapeNetService,
    ScrapePoslovniService,
    ScrapeSlobodnaDalmacijaService,
    ScrapeSportskeNovostiService,
    ScrapeTportalService,
    ScrapeVecernjiService,
    ScrapeZagrebService,
  ],
  exports: [
    Scrape24SataService,
    ScrapeDanasService,
    ScrapeDirektnoService,
    ScrapeDnevnikService,
    ScrapeDnevnoService,
    ScrapeIndexService,
    ScrapeJutarnjiService,
    ScrapeNetService,
    ScrapePoslovniService,
    ScrapeSlobodnaDalmacijaService,
    ScrapeSportskeNovostiService,
    ScrapeTportalService,
    ScrapeVecernjiService,
    ScrapeZagrebService,
  ],
})
export class ScrapersModule {}
