import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOpcioneDto {
  @ApiProperty({
    description: 'Texto de la opción disponible para la pregunta',
    example: 'Rojo',
  })
  @IsString()
  @IsNotEmpty()
  texto: string;

  @ApiProperty({
    description: 'Número de orden de la opción dentro de la pregunta',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  numero: number;
}
