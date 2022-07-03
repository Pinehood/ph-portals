import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UtilsModule } from "@utils/utils.module";

@Module({
  imports: [UtilsModule, ConfigModule.forRoot()],
  providers: [],
  exports: [],
})
export class ScrapersModule {}
