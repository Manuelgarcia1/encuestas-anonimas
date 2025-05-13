import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';

async function bootstrap() {
  // 1️⃣ Creamos la aplicación Nest a partir de nuestro módulo raíz
  const app = await NestFactory.create(AppModule);

  // 2️⃣ Añadimos Helmet para cabeceras HTTP de seguridad
  //    (protege contra XSS, content sniffing, clickjacking…)
  app.use(helmet());

  // 3️⃣ Obtenemos el servicio de configuración para leer variables de entorno
  const configService = app.get(ConfigService);

  // 4️⃣ Prefijo global de todas las rutas: e.g. /api/encuestas…
  const globalPrefix: string = configService.get<string>('PREFIX') as string;
  app.setGlobalPrefix(globalPrefix);

  // 5️⃣ Versionado de la API por URI: /v1/encuestas…
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // 6️⃣ Validación automática de todos los DTOs entrantes
  //    - whitelist: descarta propiedades no declaradas en el DTO
  //    - forbidNonWhitelisted: rechaza la petición si aparecen extras
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // 7️⃣ Serialización de respuestas usando decoradores de clase
  //    - @Exclude(), @Transform(), etc., via ClassSerializerInterceptor
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // 8️⃣ Arrancamos el servidor en el puerto definido en .env (o 3000 por defecto)
  const port: number = configService.get<number>('PORT') as number;
  await app.listen(port);
}
bootstrap();
