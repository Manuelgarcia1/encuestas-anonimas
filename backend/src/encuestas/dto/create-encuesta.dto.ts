import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreatePreguntaDto } from '../../preguntas/dto/create-pregunta.dto';

export class CreateEncuestaDto {
  @ApiProperty({
    example: 'Encuesta de satisfacción',
    description: 'Nombre de la encuesta',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    type: [CreatePreguntaDto],
    description: 'Lista de preguntas a incluir',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePreguntaDto)
  preguntas: CreatePreguntaDto[];
}
