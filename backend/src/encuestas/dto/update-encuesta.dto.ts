// src/encuestas/dto/update-encuesta.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsArray,
  IsInt,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdatePreguntaDto } from '../../preguntas/dto/update-pregunta.dto';

export class UpdateEncuestaDto {
  @ApiPropertyOptional({ description: 'Nuevo nombre de la encuesta' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({
    type: [Number],
    description: 'IDs de preguntas a eliminar',
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  eliminarPreguntas?: number[];

  @ApiPropertyOptional({
    type: [UpdatePreguntaDto],
    description: 'Preguntas a crear/editar',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePreguntaDto)
  preguntas?: UpdatePreguntaDto[];
}
