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

export class CreatePreguntaDto {
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
  @Type(() => CreateOpcioneDto)
  opciones?: CreateOpcioneDto[];
}
