import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncuestasModule } from './encuestas/encuestas.module';
import { CreadoresModule } from './creadores/creadores.module';

@Module({
  imports: [
    // 2.1 Carga y valida variables de entorno de forma global
    ConfigModule.forRoot({
      load:        [configuration],
      isGlobal:    true,
    }),

    // 2.2 Configura la conexión a PostgreSQL y registra entidades
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject:  [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type:        'postgres',
        host:        cfg.get<string>('DATABASE.HOST'),
        port:        cfg.get<number>('DATABASE.PORT'),
        username:    cfg.get<string>('DATABASE.USERNAME'),
        password:    cfg.get<string>('DATABASE.PASSWORD'),
        database:    cfg.get<string>('DATABASE.NAME'),
        synchronize: cfg.get<boolean>('DATABASE.SYNCHRONIZE'),
        autoLoadEntities: true,
        logging:     cfg.get<boolean>('DATABASE.LOGGING'),
        logger:      cfg.get<string>('DATABASE.LOGGER') as any,
      }),
    }),
    
    // 2.3 Importa módulo de encuestas (controllers + services + repositorios)
    EncuestasModule,
    //2.4 Importa módulo de creadores (controllers + services + repositorios)
    CreadoresModule,
  ],
})
export class AppModule {}
