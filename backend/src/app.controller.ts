// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { LocalCacheService } from './cache/local-cache.service';

@Controller()
export class AppController {
  constructor(private readonly cache: LocalCacheService) {}

  @Get('test-cache-set')
  testSet() {
    this.cache.set('foo', 'bar');
    return { ok: true };
  }

  @Get('test-cache-get')
  testGet() {
    const foo = this.cache.get<string>('foo');
    return { foo: foo ?? null };
  }
}
