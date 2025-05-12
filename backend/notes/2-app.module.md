| Sección             | Qué hace                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------- |
| **ConfigModule**    | Lee y valida tu `.env` al arrancar (p. ej. `PREFIX`, `PORT`, `DB_*`).                         |
| **TypeOrmModule**   | Inicializa la conexión a la base de datos y prepara los repositorios para inyección.          |
| **EncuestasModule** | Contiene toda la lógica de tu dominio “encuestas”: entidades, DTOs, servicios, controladores. |

## Relación con `main.ts`

1. **Bootstrap con `NestFactory`**

   - En `main.ts` llamamos a:
     ```ts
     const app = await NestFactory.create(AppModule);
     ```
   - Nest lee la metadata de `AppModule` (`imports`, `controllers`, `providers`, etc.).
   - Inyecta los módulos listados en `imports` (`ConfigModule`, `TypeOrmModule`, `EncuestasModule`) y construye el grafo de dependencias.

2. **Disponibilidad de `ConfigService`**

   - Al usar:
     ```ts
     ConfigModule.forRoot({ isGlobal: true });
     ```
     en `app.module.ts`, `ConfigService` queda registrado globalmente.
   - En `main.ts` obtenemos este servicio con:
     ```ts
     const configService = app.get(ConfigService);
     ```

3. **Conexión a la base de datos antes de escuchar**

   - `TypeOrmModule.forRoot(...)` se ejecuta durante el bootstrap.
   - Si la base de datos no responde correctamente, el arranque de Nest falla y **no** llega a:
     ```ts
     await app.listen(port);
     ```
   - Así evitamos exponer la API sin que la persistencia esté operativa.

4. **Exposición de rutas de encuestas**
   - `EncuestasModule` declara sus controladores con:
     ```ts
     @Controller('encuestas')
     ```
   - Gracias a `app.setGlobalPrefix(PREFIX)` y `app.enableVersioning(...)` en `main.ts`, todas las rutas de encuestas quedan bajo:
     ```
     /api/v1/encuestas
     ```
