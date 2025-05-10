import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { CodigoTipoEnum } from '../enums/codigo-tipo.enum';

export class GetEncuestaDto {
  @IsUUID('4')
  @IsNotEmpty()
  codigo: string;

  @IsEnum(CodigoTipoEnum)
  @IsNotEmpty()
  tipo: CodigoTipoEnum;
}
