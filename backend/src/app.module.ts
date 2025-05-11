import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncuestasModule } from './encuestas/encuestas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE.HOST'),
        port: configService.get<number>('DATABASE.PORT'),
        username: configService.get<string>('DATABASE.USERNAME'),
        password: configService.get<string>('DATABASE.PASSWORD'),
        database: configService.get<string>('DATABASE.NAME'),
        synchronize: true,
        autoLoadEntities: true,
        // No se agrega el tipado de datos porque genera conflictos con el tipo esperado
        logging: configService.get('DATABASE.LOGGING'),
        logger: configService.get('DATABASE.LOGGER'),
      }),
    }),
    EncuestasModule,
  ],
})
export class AppModule {}
