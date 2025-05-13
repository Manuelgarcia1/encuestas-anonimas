import { PartialType } from '@nestjs/swagger';
import { CreateOpcioneDto } from './create-opcione.dto';

export class UpdateOpcioneDto extends PartialType(CreateOpcioneDto) {}
