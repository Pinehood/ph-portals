import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import {
  Scrape24SataService,
  ScrapeDirektnoService,
  ScrapeDnevnikService,
  ScrapeDnevnoService,
  ScrapeIndexService,
  ScrapeJutarnjiService,
  ScrapeNetService,
  ScrapeSlobodnaDalmacijaService,
  ScrapeSportskeNovostiService,
  ScrapeTportalService,
  ScrapeVecernjiService,
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
    ScrapeDirektnoService,
    ScrapeDnevnikService,
    ScrapeDnevnoService,
    ScrapeIndexService,
    ScrapeJutarnjiService,
    ScrapeNetService,
    ScrapeSlobodnaDalmacijaService,
    ScrapeSportskeNovostiService,
    ScrapeTportalService,
    ScrapeVecernjiService,
  ],
  exports: [
    Scrape24SataService,
    ScrapeDirektnoService,
    ScrapeDnevnikService,
    ScrapeDnevnoService,
    ScrapeIndexService,
    ScrapeJutarnjiService,
    ScrapeNetService,
    ScrapeSlobodnaDalmacijaService,
    ScrapeSportskeNovostiService,
    ScrapeTportalService,
    ScrapeVecernjiService,
  ],
})
export class ScrapersModule {}
