import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import IORedis, { Redis } from "ioredis";
import { CommonConstants } from "@modules/common";

@Injectable()
export class RedisService {
  private redis: Redis;

  constructor(
    @InjectPinoLogger(RedisService.name) private readonly logger: PinoLogger
  ) {
    if (process.env.IS_JEST_ENV !== CommonConstants.TRUE_STRING) {
      this.redis = new IORedis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASS,
      });
    }
  }

  listRemove(key: string, value: string): Promise<number> {
    return this.redis.lrem(key, 0, value);
  }

  listLength(key: string): Promise<number> {
    return this.redis.llen(key);
  }

  listRange(key: string, start: number, end: number): Promise<string[]> {
    return this.redis.lrange(key, start, end);
  }

  listPush(key: string, value: any): Promise<number> {
    return this.redis.lpush(key, value);
  }

  delete(key: string): Promise<number> {
    return this.redis.del(key);
  }

  async keyExists(key: string): Promise<boolean> {
    return (await this.redis.exists(key)) === 1;
  }

  async listExists(key: string, value: string): Promise<boolean> {
    const len = await this.redis.llen(key);
    const values = await this.redis.lrange(key, 0, len);
    if (values.find((v: string) => v === value)) {
      return true;
    }
    return false;
  }
}
