import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  const configService = app.get(ConfigService);
  const port: number = configService.get<number>('PORT') || 3000;
  const globalPrefix: string = configService.get<string>('PREFIX') || 'api';

  // ✅ 1. Setear prefijo global
  app.setGlobalPrefix(globalPrefix);

  // ✅ 2. Habilitar versionado URI
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ✅ 3. Pipes globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ 4. Interceptores globales
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // ✅ 5. Swagger (después de prefix y versionado)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API de Encuestas Anónimas')
    .setDescription('Documentación generada con Swagger')
    .setVersion('1.0')
    .addTag('Encuestas')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);
  // Resultado: http://localhost:3000/api/docs

  // ✅ 6. Levantar servidor
  await app.listen(port);
}
bootstrap();
