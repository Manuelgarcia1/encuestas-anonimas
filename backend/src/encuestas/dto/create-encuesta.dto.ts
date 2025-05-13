import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEncuestaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
