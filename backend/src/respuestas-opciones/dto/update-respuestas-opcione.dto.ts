import { PartialType } from '@nestjs/swagger';
import { CreateRespuestasOpcioneDto } from './create-respuestas-opcione.dto';

export class UpdateRespuestasOpcioneDto extends PartialType(CreateRespuestasOpcioneDto) {}
