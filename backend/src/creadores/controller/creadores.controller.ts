// src/creadores/creadores.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CreadoresService } from '../services/creadores.service';
import { CreateCreadorDto } from '../dto/create-creador.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ApiResponse as CustomApiResponse } from '../../shared/response.dto';

@ApiTags('Creadores')
@Controller('creadores')
export class CreadoresController {
  constructor(private readonly creadoresService: CreadoresService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar acceso mediante email',
    description:
      'Envía un enlace de acceso al dashboard por email. Solo al crear retorna token para redirigir.',
  })
  @ApiBody({ type: CreateCreadorDto })
  @ApiResponse({
    status: 200,
    description:
      'Si user nuevo → retorna { token } en data. Si ya existía → data vacía.',
    schema: {
      example: {
        status: 'success',
        message: 'Usuario creado. Te redirijo al dashboard…',
        statusCode: 200,
        data: { token: 'eyJhbGciOi…' }, // solo con created === true
      },
    },
  })
  async requestAccess(
    @Body() dto: CreateCreadorDto,
  ): Promise<CustomApiResponse<{ token?: string }>> {
    const { created, token } = await this.creadoresService.requestAccess(
      dto.email,
    );

    const message = created
      ? 'Usuario registrado. Te redirijo al dashboard…'
      : 'Ya te encuentras registrado. Revisa tu correo para acceder al dashboard.';

    // Si es nuevo, incluyo token en data; si no, data queda undefined
    const data = created ? { token } : undefined;

    return new CustomApiResponse('success', message, HttpStatus.OK, data);
  }
}
