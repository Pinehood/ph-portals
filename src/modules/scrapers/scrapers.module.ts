import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Scrape24SataService } from "@scrapers/services";
import { UtilsModule } from "@utils/utils.module";
import { PortalsModule } from "@portals/portals.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    forwardRef(() => UtilsModule),
    forwardRef(() => PortalsModule),
  ],
  providers: [Scrape24SataService],
  exports: [Scrape24SataService],
})
export class ScrapersModule {}
