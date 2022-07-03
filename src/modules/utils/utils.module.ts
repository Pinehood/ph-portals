import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CronService, RedisService } from "@utils/services";

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [RedisService, CronService],
  exports: [RedisService],
})
export class UtilsModule {}
