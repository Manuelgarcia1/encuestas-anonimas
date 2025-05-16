import { Injectable } from '@nestjs/common';
import NodeCache from 'node-cache';

/**
 * Servicio para manejo de cache local en memoria utilizando node-cache.
 * TTL por defecto: 60 segundos.
 */
@Injectable()
export class LocalCacheService {
  // stdTTL: 60s, checkperiod: 120s
  private cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

  /**
   * Recupera un valor del cache.
   * @param key Clave de búsqueda
   */
  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  /**
   * Guarda un valor en el cache.
   * @param key Clave de almacenamiento
   * @param value Valor a almacenar
   * @param ttl Tiempo de vida en segundos (opcional)
   */
  set<T>(key: string, value: T, ttl?: number): void {
    if (ttl) {
      this.cache.set<T>(key, value, ttl);
    } else {
      this.cache.set<T>(key, value);
    }
  }

  /**
   * Elimina un valor del cache por su clave.
   */
  del(key: string): void {
    this.cache.del(key);
  }

  /**
   * Elimina todos los valores almacenados en cache.
   */
  flush(): void {
    this.cache.flushAll();
  }
}
