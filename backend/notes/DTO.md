# Data Transfer Objects (DTOs) de Encuestas

Este archivo describe en detalle los DTOs que definen la forma y validación de los datos que entran y salen en el módulo de **encuestas**. También explica cómo se relacionan entre sí y el flujo de datos durante la creación y consulta de encuestas.

---

## 1. `CreateEncuestaDTO`

```ts
export class CreateEncuestaDTO {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePreguntaDTO)
  preguntas: CreatePreguntaDTO[];
}
```

### Propósito

Definir la estructura y validaciones para crear una encuesta.

Asegurarse de que:

nombre exista y sea un string.

preguntas sea un array no vacío de al menos 1 elemento.

Cada elemento de preguntas sea validado como CreatePreguntaDTO.

Decoradores de validación
@IsString(), @IsNotEmpty():
— nombre debe ser texto no vacío.

@IsArray(), @ArrayNotEmpty(), @ArrayMinSize(1):
— preguntas debe ser un arreglo con al menos 1 pregunta.

@ValidateNested({ each: true }) + @Type(() => CreatePreguntaDTO):
— Nest, junto con class-transformer, transforma y valida cada objeto como CreatePreguntaDTO.

## 2. `CreatePreguntaDTO`

```ts
export class CreatePreguntaDTO {
  @IsNumber()
  @IsNotEmpty()
  numero: number;

  @IsString()
  @IsNotEmpty()
  texto: string;

  @IsEnum(TiposRespuestaEnum)
  @IsNotEmpty()
  tipo: TiposRespuestaEnum;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateOpcionDTO)
  opciones?: CreateOpcionDTO[];
}
```

### Propósito

Modelar cada pregunta dentro de una encuesta.

Garantizar:

numero: identificador ordenado de la pregunta (número).

texto: enunciado de la pregunta (string no vacío).

tipo: corresponde a un valor de TiposRespuestaEnum (ABIERTA, OPCION_SIMPLE, OPCION_MULTIPLE).

opciones: (solo para preguntas de opción) un array de CreateOpcionDTO, validado y transformado.

Decoradores de validación
@IsNumber(), @IsNotEmpty():
— numero debe existir y ser un número.

@IsString(), @IsNotEmpty():
— texto debe existir y ser texto.

@IsEnum(TiposRespuestaEnum), @IsNotEmpty():
— tipo debe estar dentro de los valores permitidos.

@IsArray(), @IsOptional():
— opciones puede omitirse; si existe, debe ser un arreglo.

@ValidateNested({ each: true }) + @Type(() => CreateOpcionDTO):
— cada objeto de opciones se valida como CreateOpcionDTO.

### 3. CreateOpcionDTO

```ts
export class CreateOpcionDTO {
  @IsString()
  @IsNotEmpty()
  texto: string;

  @IsNumber()
  @IsNotEmpty()
  numero: number;
}
```

### Propósito

Representar cada opción de respuesta para preguntas de selección.

Asegurar:

texto: descripción de la opción (string no vacío).

numero: valor numérico/e identificador de la opción.

Decoradores de validación
@IsString(), @IsNotEmpty():
— texto debe ser un string.

@IsNumber(), @IsNotEmpty():
— numero debe ser un número.

### 4. GetEncuestaDto

```ts
export class GetEncuestaDto {
  @IsUUID('4')
  @IsNotEmpty()
  codigo: string;

  @IsEnum(CodigoTipoEnum)
  @IsNotEmpty()
  tipo: CodigoTipoEnum;
}
```

### Propósito

# Validar los parámetros de ruta o query al consultar una encuesta o sus respuestas.

## Asegurar:

codigo: un UUID v4 que identifica el enlace (participación o visualización).

tipo: un valor de CodigoTipoEnum (p.e. PARTICIPACION, VISUALIZACION).

# Decoradores de validación

```ts
@IsUUID('4'), @IsNotEmpty():
— codigo debe ser un UUID versión 4 válido.

@IsEnum(CodigoTipoEnum), @IsNotEmpty():
— tipo debe corresponder a un tipo de enlace definido.
```

# 5. Flujo de datos y validación

# Cliente envía JSON al endpoint correspondiente:

# Crear encuesta:

POST /api/v1/encuestas
Body → validado contra CreateEncuestaDTO.

Crear pregunta u opción se anida automáticamente.

# Obtener encuesta/respuestas:

GET /api/v1/encuestas/:codigo?tipo=PARTICIPACION
Parámetros → validados contra GetEncuestaDto.

# NestJS transforma y valida:

ValidationPipe (global) aplica las reglas de cada DTO.

class-transformer convierte objetos JSON en instancias de las clases DTO.

Controller recibe instancias validadas:

```ts
@Post()
create(@Body() dto: CreateEncuestaDTO) { … }

@Get(':codigo')
findOne(@Param() dto: GetEncuestaDto) { … }
```

# Service procesa:

Usa los datos limpios para mapear a entidades (EncuestaEntity, PreguntaEntity, OpcionEntity).

Persiste en la base de datos con repositorios TypeORM.

# Respuesta al cliente:

Si hay errores de validación → 400 Bad Request con detalles.

Si todo OK → 201 Created o 200 OK con la entidad resultante.
