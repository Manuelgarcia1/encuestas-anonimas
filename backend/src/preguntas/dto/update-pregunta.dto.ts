import { PartialType } from '@nestjs/swagger';
import { CreatePreguntaDto } from './create-pregunta.dto';

export class UpdatePreguntaDto extends PartialType(CreatePreguntaDto) {}
