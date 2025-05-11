import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateOpcionDTO {
  @IsString()
  @IsNotEmpty()
  texto: string;

  @IsNumber()
  @IsNotEmpty()
  numero: number;
}
