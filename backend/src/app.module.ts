import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncuestasModule } from './encuestas/encuestas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load:        [configuration],
      isGlobal:    true,
    }),
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
    EncuestasModule,
  ],
})
export class AppModule {}
