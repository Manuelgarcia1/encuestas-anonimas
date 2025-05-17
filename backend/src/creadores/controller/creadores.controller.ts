// src/creadores/creadores.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CreadoresService } from '../services/creadores.service';
import { CreateCreadorDto } from '../dto/create-creador.dto';
import { ApiResponse as CustomApiResponse } from '../../shared/response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Creadores')
@Controller('creadores')
export class CreadoresController {
  constructor(private readonly creadoresService: CreadoresService) {}

  /**
   * Envía un magic-link al email.
   * (200 OK siempre para no filtrar existencia)
   */
  @Post()
  @ApiOperation({
    summary: 'Solicitar acceso mediante email',
    description:
      'Envía un enlace de acceso al dashboard por email. No revela si el correo ya existe.',
  })
  @ApiBody({ type: CreateCreadorDto })
  @ApiResponse({
    status: 200,
    description: 'Solicitud procesada con éxito. Siempre retorna 200 OK.',
    schema: {
      example: {
        status: 'success',
        message:
          'Usuario registrado exitosamente. Se ha enviado tu enlace al dashboard.',
        statusCode: 200,
        data: {
          message:
            'Usuario registrado exitosamente. Se ha enviado tu enlace al dashboard.',
        },
      },
    },
  })
  async requestAccess(
    @Body() dto: CreateCreadorDto,
  ): Promise<CustomApiResponse<{ message: string; token: string }>> {
    // 1️⃣ Llamamos al Service, que nos dice si creó un nuevo Creador
    const { created, token } = await this.creadoresService.requestAccess(
      dto.email,
    );

    // 2️⃣ Definimos mensajes distintos según el caso
    const text = created
      ? 'Usuario registrado exitosamente. Se ha enviado tu enlace al dashboard.'
      : 'Ya estabas registrado. Te hemos reenviado el enlace de acceso al dashboard.';

    // 3️⃣ Devolvemos ApiResponse con el mensaje adecuado
    return new CustomApiResponse<{ message: string; token: string }>(
      'success', // status lógico
      text, // mensaje principal
      HttpStatus.OK, // código HTTP interno
      { message: text, token }, // payload data
    );
  }
}
