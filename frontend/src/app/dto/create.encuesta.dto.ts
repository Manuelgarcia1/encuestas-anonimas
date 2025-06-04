import { CreatePreguntasDto } from './create.preguntas.dto';

export interface CreateEncuestaDto {
  nombre: string;
  preguntas: CreatePreguntasDto[];
}
