import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { CreadoresService } from '../services/creadores.service';
import { CreateCreadorDto } from '../dto/create-creador.dto';
import { ApiResponse } from '../../shared/response.dto'; // Importamos ApiResponse

@Controller('creadores')
export class CreadoresController {
  constructor(private readonly svc: CreadoresService) {}

  /**
   * POST /creadores
   * Dispara el envío del magic-link al e-mail.
   * 200 siempre, para no filtrar existencia.
   */
  @Post()
  async requestAccess(
    @Body() dto: CreateCreadorDto,
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      await this.svc.requestAccess(dto.email);

      return new ApiResponse(
        'success',
        'Si ese correo está registrado, recibirás un enlace de acceso al dashboard.',
        HttpStatus.OK,
      );
    } catch (error) {
      throw new HttpException(
        new ApiResponse('error', error.message, HttpStatus.BAD_REQUEST),
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
