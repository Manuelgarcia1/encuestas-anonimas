// src/creadores/creadores.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CreadoresService } from '../services/creadores.service';
import { CreateCreadorDto } from '../dto/create-creador.dto';
import { ApiResponse } from '../../shared/response.dto';

@Controller('creadores')
export class CreadoresController {
  constructor(private readonly creadoresService: CreadoresService) {}

  /**
   * Envía un magic-link al email.
   * (200 OK siempre para no filtrar existencia)
   */
  @Post()
  async requestAccess(
    @Body() dto: CreateCreadorDto,
  ): Promise<ApiResponse<{ message: string; token: string }>> {
    // 1️⃣ Llamamos al Service, que nos dice si creó un nuevo Creador
    const { created, token } = await this.creadoresService.requestAccess(
      dto.email,
    );

    // 2️⃣ Definimos mensajes distintos según el caso
    const text = created
      ? 'Usuario registrado exitosamente. Se ha enviado tu enlace al dashboard.'
      : 'Ya estabas registrado. Te hemos reenviado el enlace de acceso al dashboard.';

    // 3️⃣ Devolvemos ApiResponse con el mensaje adecuado
    return new ApiResponse<{ message: string; token: string }>(
      'success', // status lógico
      text, // mensaje principal
      HttpStatus.OK, // código HTTP interno
      { message: text, token }, // payload data
    );
  }
}
