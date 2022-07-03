import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScrapersModule } from "@scrapers/scrapers.module";
import { PortalsController } from "@portals/controllers";

@Module({
  imports: [ScrapersModule, ConfigModule.forRoot()],
  controllers: [PortalsController],
  providers: [],
  exports: [],
})
export class PortalsModule {}
