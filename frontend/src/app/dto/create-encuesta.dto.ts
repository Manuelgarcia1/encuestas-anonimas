import { CreatePreguntaDto } from './create-pregunta.dto';

export interface CreateEncuestaDto {
  nombre: string;
  preguntas: CreatePreguntaDto[];
}
