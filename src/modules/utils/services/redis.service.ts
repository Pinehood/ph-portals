import { Injectable } from "@nestjs/common";
import IORedis, { Redis } from "ioredis";
import { CommonConstants } from "@resources/common/constants";

@Injectable()
export class RedisService {
  private redis: Redis;

  constructor() {
    this.init();
  }

  private init(): void {
    if (process.env.IS_JEST_ENV !== CommonConstants.TRUE_STRING) {
      this.redis = new IORedis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASS,
      });
    }
  }

  get(key: string): Promise<string> {
    return this.redis.get(key);
  }

  set(key: string, value: any): Promise<string> {
    return this.redis.set(key, value);
  }

  delete(key: string): Promise<number> {
    return this.redis.del(key);
  }

  async keyExists(key: string): Promise<boolean> {
    return (await this.redis.exists(key)) === 1;
  }

  async valueExists(key: string, value: string): Promise<boolean> {
    const len = await this.redis.llen(key);
    const values = await this.redis.lrange(key, 0, len);
    if (values.find((v: string) => v === value)) {
      return true;
    }
    return false;
  }
}
