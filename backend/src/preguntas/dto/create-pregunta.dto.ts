import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TiposRespuestaEnum } from '../../preguntas/enums/tipos-respuestas.enum';
import { Type } from 'class-transformer';
import { CreateOpcioneDto } from './../../opciones/dto/create-opcione.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePreguntaDto {
  @ApiProperty({
    description: 'Número de orden de la pregunta',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  numero: number;

  @ApiProperty({
    description: 'Texto o enunciado de la pregunta',
    example: '¿Cuál es tu color favorito?',
  })
  @IsString()
  @IsNotEmpty()
  texto: string;

  @ApiProperty({
    description: 'Tipo de respuesta esperada para la pregunta',
    enum: TiposRespuestaEnum,
    example: TiposRespuestaEnum.OPCION_MULTIPLE_SELECCION_SIMPLE,
  })
  @IsEnum(TiposRespuestaEnum)
  @IsNotEmpty()
  tipo: TiposRespuestaEnum;

  @ApiPropertyOptional({
    description: 'Opciones disponibles para preguntas de selección múltiple',
    type: [CreateOpcioneDto],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateOpcioneDto)
  opciones?: CreateOpcioneDto[];
}
