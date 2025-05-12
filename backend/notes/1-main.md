# 1. Arranque de la aplicación (`main.ts`)

> **NestFactory.create(AppModule)**  
> Carga el módulo raíz y pone en marcha el contenedor de NestJS.

1. **Helmet**
   - Middleware de seguridad HTTP.
2. **ConfigService**
   - Lectura tipada de variables de entorno.
3. **setGlobalPrefix**
   - Aplica un prefijo único `/PREFIX` a todas las rutas.
4. **enableVersioning**
   - Versionado URI: `v1`, `v2`, …
5. **ValidationPipe**
   - Descarta (whitelist) o rechaza (forbid…) propiedades inesperadas.
6. **ClassSerializerInterceptor**
   - Aplica `@Exclude()` y demás decoradores antes de enviar JSON.
7. **app.listen**
   - Inicia el servidor en `PORT`.

### Llamadas a la API con prefijo y versionado

Si en tu `.env` tienes:

```dotenv
PREFIX=api
PORT=3000

y habilitaste versionado por URI con defaultVersion: '1', todas tus rutas quedarán bajo:
/api/v1/…

| Descripción            | Método | Ruta                                      |
| ---------------------- | :----: | ----------------------------------------- |
| **Crear una encuesta** |  POST  | `/api/v1/encuestas`                       |
| **Listar encuestas**   |   GET  | `/api/v1/encuestas`                       |
| **Responder encuesta** |  POST  | `/api/v1/encuestas/:linkToken/responder`  |
| **Ver respuestas**     |   GET  | `/api/v1/encuestas/:viewToken/respuestas` |

```
