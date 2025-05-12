import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateCreadorDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
