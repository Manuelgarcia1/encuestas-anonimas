import { IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RespuestaAbiertaDto {
  @ApiProperty({
    description: 'ID de la pregunta abierta',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  id_pregunta: number;

  @ApiProperty({
    description: 'Texto de la respuesta',
    example: 'Me gustó la encuesta',
  })
  @IsString()
  @IsNotEmpty()
  texto: string;
}
