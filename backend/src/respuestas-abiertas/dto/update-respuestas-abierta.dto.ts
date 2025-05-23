import { PartialType } from '@nestjs/swagger';
import { RespuestaAbiertaDto } from './create-respuestas-abierta.dto';

export class UpdateRespuestasAbiertaDto extends PartialType(
  RespuestaAbiertaDto,
) {}
