// src/preguntas/dto/update-pregunta.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  IsString,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TiposRespuestaEnum } from '../enums/tipos-respuestas.enum';
import { UpdateOpcioneDto } from '../../opciones/dto/update-opcione.dto';

export class UpdatePreguntaDto {
  @ApiPropertyOptional({ description: 'ID de la pregunta (si existe)' })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiPropertyOptional({ description: 'Texto de la pregunta' })
  @IsOptional()
  @IsString()
  texto?: string;

  @ApiPropertyOptional({
    enum: TiposRespuestaEnum,
    description: 'Tipo de respuesta',
  })
  @IsOptional()
  @IsEnum(TiposRespuestaEnum)
  tipo?: TiposRespuestaEnum;

  @ApiPropertyOptional({
    type: [Number],
    description: 'IDs de opciones a eliminar',
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  eliminarOpciones?: number[];

  @ApiPropertyOptional({
    type: [UpdateOpcioneDto],
    description: 'Opciones a crear/editar',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOpcioneDto)
  opciones?: UpdateOpcioneDto[];
}
