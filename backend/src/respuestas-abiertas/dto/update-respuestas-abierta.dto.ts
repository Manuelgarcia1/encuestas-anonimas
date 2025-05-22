import { PartialType } from '@nestjs/swagger';
import { CreateRespuestasAbiertaDto } from './create-respuestas-abierta.dto';

export class UpdateRespuestasAbiertaDto extends PartialType(CreateRespuestasAbiertaDto) {}
