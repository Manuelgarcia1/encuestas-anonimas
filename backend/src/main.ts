// NestFactory: crea la aplicación NestJS
// Reflector: se usa internamente por ClassSerializerInterceptor
import { NestFactory, Reflector } from '@nestjs/core';

// Módulo raíz de la app
import { AppModule } from './app.module';

// Helmet: middleware de seguridad para headers HTTP
import helmet from 'helmet';

// ConfigService: para leer variables de entorno
import { ConfigService } from '@nestjs/config';

// Clases comunes de Nest:
// - ClassSerializerInterceptor: formatea la respuesta según los decoradores @Exclude, @Expose
// - ValidationPipe: valida y transforma DTOs
// - VersioningType: enum para estrategias de versionado de la API
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';

// Swagger: para generar documentación automática
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// Cookie-parser: parsea cookies de las peticiones y las deja en req.cookies
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  // Creamos la app NestJS a partir de AppModule
  const app = await NestFactory.create(AppModule);

  // ① Middleware: parseo de cookies  ⇒ req.cookies estará disponible
  app.use(cookieParser());

  // ② Middleware: helmet ⇒ establece headers de seguridad comunes
  app.use(helmet());

  // Obtenemos configuración (puerto, prefijo) desde variables de entorno
  const configService = app.get(ConfigService);
  const port: number = configService.get<number>('PORT') || 3000;
  const globalPrefix: string = configService.get<string>('PREFIX') || 'api';

  // Configuración global de la API
  // 1. Prefijo para todas las rutas (ej: /api/...)
  app.setGlobalPrefix(globalPrefix);

  // 2. Habilitar versionado por URI (ej: /api/v1/...)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // 3. Pipes globales: validación y transformación de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // lanza error si llegan props extra
      transform: true, // convierte payloads a instancias de clases
    }),
  );

  // 4. Interceptores globales: formateo de respuestas con serialización
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // 5. Swagger: configuración y endpoint de documentación
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API de Encuestas Anónimas')
    .setDescription('Documentación generada con Swagger')
    .setVersion('1.0')
    .addTag('Encuestas')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);
  // Resultado: http://localhost:3000/api/docs

  // 6. Levantar servidor
  await app.listen(port);
  console.log(`Servidor corriendo en http://localhost:${port}/${globalPrefix}`);
  // ──────────────────────────────────────────────────────────────────────
}

bootstrap();
