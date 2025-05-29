// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { EncuestasModule } from './encuestas/encuestas.module';
import { CreadoresModule } from './creadores/creadores.module';
import { PreguntasModule } from './preguntas/preguntas.module';
import { OpcionesModule } from './opciones/opciones.module';
import { LocalCacheService } from './cache/local-cache.service';
import { RespuestasModule } from './respuestas/respuestas.module';
import { RespuestasAbiertasModule } from './respuestas-abiertas/respuestas-abiertas.module';
import { RespuestasOpcionesModule } from './respuestas-opciones/respuestas-opciones.module';

@Module({
  imports: [
    // 2.1 Variables de entorno
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),

    // 2.3 PostgreSQL / TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get<string>('DATABASE.HOST'),
        port: cfg.get<number>('DATABASE.PORT'),
        username: cfg.get<string>('DATABASE.USERNAME'),
        password: cfg.get<string>('DATABASE.PASSWORD'),
        database: cfg.get<string>('DATABASE.NAME'),
        synchronize: cfg.get<boolean>('DATABASE.SYNCHRONIZE'),
        autoLoadEntities: true,
        logging: cfg.get<boolean>('DATABASE.LOGGING'),
        logger: cfg.get<string>('DATABASE.LOGGER') as any,
      }),
    }),

    // 2.4 Tus módulos de dominio
    EncuestasModule,
    CreadoresModule,
    PreguntasModule,
    OpcionesModule,
    RespuestasModule,
    RespuestasAbiertasModule,
    RespuestasOpcionesModule,
  ],
  controllers: [AppController],
  providers: [LocalCacheService],
})
export class AppModule {}
