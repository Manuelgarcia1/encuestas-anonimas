## 4. Módulo de Encuestas (`src/encuestas/encuestas.module.ts`)

### 4.1 `imports: [ TypeOrmModule.forFeature(...) ]`

`TypeOrmModule.forFeature([...])` registra estas entidades para que Nest inyecte automáticamente sus repositorios (`Repository<T>`) en tu servicio:

- **Creador** → tabla `creadores`
- **Encuesta** → tabla `encuestas`
- **Pregunta** → tabla `preguntas`
- **Opcion** → tabla `opciones`

---

### 4.2 `controllers: [ EncuestasController ]`

### El controlador expone los endpoints HTTP:

```ts
@Controller('encuestas')
export class EncuestasController { … }
```

### Métodos como @Post() crearEncuesta(), @Get(':linkToken/respuestas'), etc.

## Orquesta la validación (DTOs), aplica guards/interceptors y delega la lógica al servicio.

### 4.3 providers: [ EncuestasService ]

## El servicio implementa la lógica central:

# Crear encuestas y generar tokens.

# Persistir preguntas y opciones.

# Recuperar respuestas y estadísticas.

# Inyecta los repositorios de las entidades anteriores:

```ts
constructor(
  @InjectRepository(Encuesta) private encuestaRepo: Repository<Encuesta>,
  @InjectRepository(Pregunta) private preguntaRepo: Repository<Pregunta>,
  // …
) {}
Relación con AppModule
En src/app.module.ts importas EncuestasModule:

@Module({
  imports: [
    // …otros módulos…
    EncuestasModule,
  ],
})
export class AppModule {}
De este modo, Nest conoce todos los controladores y servicios de este módulo y los registra en el grafo de dependencias global.
```
