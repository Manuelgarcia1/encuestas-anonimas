import { PartialType } from '@nestjs/swagger';
import { RespuestaOpcionDto } from './create-respuestas-opcione.dto';

export class UpdateRespuestasOpcioneDto extends PartialType(
  RespuestaOpcionDto,
) {}
