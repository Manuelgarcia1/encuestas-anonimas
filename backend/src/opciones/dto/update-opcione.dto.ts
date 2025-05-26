// src/opciones/dto/update-opcione.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString } from 'class-validator';

export class UpdateOpcioneDto {
  @ApiPropertyOptional({ description: 'ID de la opción (si existe)' })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiPropertyOptional({ description: 'Texto de la opción' })
  @IsOptional()
  @IsString()
  texto?: string;

  @ApiPropertyOptional({
    description: 'Orden de la opción dentro de la pregunta',
  })
  @IsOptional()
  @IsInt()
  numero?: number;
}
