import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCreadorDto {
  @ApiProperty({
    description:
      'Correo electrónico del creador que solicita acceso al sistema',
    example: 'usuario@ejemplo.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
