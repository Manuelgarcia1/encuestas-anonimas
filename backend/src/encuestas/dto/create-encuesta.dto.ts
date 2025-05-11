import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreatePreguntaDTO } from './create-pregunta.dto';

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
