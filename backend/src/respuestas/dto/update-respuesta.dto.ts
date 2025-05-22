import { PartialType } from '@nestjs/swagger';
import { CreateRespuestaDto } from './create-respuesta.dto';

export class UpdateRespuestaDto extends PartialType(CreateRespuestaDto) {}
