import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateOpcioneDto {
  @IsString()
  @IsNotEmpty()
  texto: string;

  @IsNumber()
  @IsNotEmpty()
  numero: number;
}
