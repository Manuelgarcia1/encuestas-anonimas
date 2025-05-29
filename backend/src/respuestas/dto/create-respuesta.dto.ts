// src/respuestas/dto/create-respuesta.dto.ts
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RespuestaAbiertaDto } from '../../respuestas-abiertas/dto/create-respuestas-abierta.dto';
import { RespuestaOpcionDto } from '../../respuestas-opciones/dto/create-respuestas-opcione.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRespuestaDto {
  @ApiProperty({
    description: 'Respuestas a preguntas abiertas',
    type: [RespuestaAbiertaDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RespuestaAbiertaDto)
  respuestas_abiertas: RespuestaAbiertaDto[];

  @ApiProperty({
    description: 'Respuestas a preguntas de opción múltiple',
    type: [RespuestaOpcionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RespuestaOpcionDto)
  respuestas_opciones: RespuestaOpcionDto[];
}
