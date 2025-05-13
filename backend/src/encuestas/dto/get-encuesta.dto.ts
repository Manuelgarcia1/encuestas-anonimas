import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { TokenTipoEnum } from '../enums/token-tipo.enum';

export class GetEncuestaDto {
  @IsUUID('4')
  @IsNotEmpty()
  codigo: string;

  @IsEnum(TokenTipoEnum)
  @IsNotEmpty()
  tipo: TokenTipoEnum;
}
