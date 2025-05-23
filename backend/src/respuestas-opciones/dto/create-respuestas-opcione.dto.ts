// src/respuestas/dto/respuesta-opcion.dto.ts
import { IsNumber, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RespuestaOpcionDto {
  @ApiProperty({
    description: 'ID de la pregunta de opción múltiple',
    example: 2,
  })
  @IsNumber()
  @IsNotEmpty()
  id_pregunta: number;

  @ApiProperty({
    description: 'IDs de las opciones seleccionadas',
    example: [5],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  id_opciones: number[];
}
