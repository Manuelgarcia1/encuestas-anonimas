import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { CodigoTipoEnum } from '../enums/token-tipo.enum';

export class GetEncuestaDto {
  @IsUUID('4')
  @IsNotEmpty()
  codigo: string;

  @IsEnum(CodigoTipoEnum)
  @IsNotEmpty()
  tipo: CodigoTipoEnum;
}
