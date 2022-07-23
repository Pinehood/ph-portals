import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UtilsModule } from "@utils/utils.module";
import { Scrape24SataService } from "@scrapers/services";

@Module({
  imports: [UtilsModule, ConfigModule.forRoot()],
  providers: [Scrape24SataService],
  exports: [Scrape24SataService],
})
export class ScrapersModule {}
