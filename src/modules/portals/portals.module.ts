import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ApiController, PortalsController } from "@portals/controllers";
import { ApiService, PortalsService } from "@portals/services";
import { ScrapersModule } from "@scrapers/scrapers.module";
import { UtilsModule } from "@utils/utils.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    forwardRef(() => ScrapersModule),
    forwardRef(() => UtilsModule),
  ],
  controllers: [ApiController, PortalsController],
  providers: [ApiService, PortalsService],
  exports: [PortalsService],
})
export class PortalsModule {}
