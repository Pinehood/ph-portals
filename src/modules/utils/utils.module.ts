import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CronService, RedisService } from "@utils/services";
import { ScrapersModule } from "@scrapers/scrapers.module";
import { PortalsModule } from "@portals/portals.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    forwardRef(() => PortalsModule),
    forwardRef(() => ScrapersModule),
  ],
  providers: [RedisService, CronService],
  exports: [RedisService],
})
export class UtilsModule {}
