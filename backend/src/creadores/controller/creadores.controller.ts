// src/creadores/creadores.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreadoresService } from '../services/creadores.service';
import { CreateCreadorDto } from '../dto/create-creador.dto';

@Controller('creadores')
export class CreadoresController {
  constructor(private readonly svc: CreadoresService) {}

  /**
   * POST /creadores
   * Dispara el envío del magic-link al e-mail.
   * 200 siempre, para no filtrar existencia.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async requestAccess(
    @Body() dto: CreateCreadorDto,
  ): Promise<{ message: string }> {
    // Llama pasando sólo el email
    await this.svc.requestAccess(dto.email);
    return {
      message:
        'Si ese correo está registrado, recibirás un enlace de acceso al dashboard.',
    };
  }
}
