// src/creadores/creadores.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';
import { CreadoresService } from '../services/creadores.service';
import { CreateCreadorDto } from '../dto/create-creador.dto';
import { ApiResponse as CustomApiResponse } from '../../shared/response.dto';
import { ConfigService } from '@nestjs/config';

@ApiTags('Creadores')
@Controller('creadores')
export class CreadoresController {
  constructor(
    private readonly creadoresService: CreadoresService,
    private readonly config: ConfigService,
  ) {}

  // 1️⃣ POST /creadores
  @Post()
  @ApiOperation({ summary: 'Solicitar acceso al dashboard' })
  @ApiBody({ type: CreateCreadorDto })
  async requestAccess(
    @Body() dto: CreateCreadorDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CustomApiResponse<{ token?: string; redirectUrl?: string }>> {
    const { created, token } = await this.creadoresService.requestAccess(
      dto.email,
    );
    const frontend =
      this.config.get<string>('FRONTEND_URL') || 'http://localhost:4200';

    // En cualquier caso enviamos el magic-link por email...
    // …pero si es la primera vez, también seteamos la cookie y devolvemos redirectUrl
    if (created) {
      res.cookie('token_dashboard', token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
      const redirectUrl = `${frontend}/dashboard`;
      return new CustomApiResponse(
        'success',
        'Usuario registrado y autenticado. Redirigiendo al dashboard…',
        HttpStatus.OK,
        { token, redirectUrl },
      );
    }

    // Si ya existía, solo informamos al usuario que revise su correo
    return new CustomApiResponse(
      'success',
      'Ya te encuentras registrado. Revisa tu correo para acceder al dashboard.',
      HttpStatus.OK,
      {},
    );
  }

  // 2️⃣ GET /creadores/ingresar/:token (cuando hace clic en el email)
  @Get('ingresar/:token')
  @ApiOperation({ summary: 'Validar enlace y setear sesión' })
  @ApiParam({ name: 'token', description: 'UUID del creador' })
  async ingresarConToken(
    @Param('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CustomApiResponse<{ redirectUrl: string }>> {
    // Validamos formato UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      throw new HttpException(
        new CustomApiResponse(
          'error',
          'Formato de token inválido. Debe ser un UUID.',
          HttpStatus.UNAUTHORIZED,
        ),
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Validamos existencia en BD
    const exists = await this.creadoresService.tokenExists(token);
    if (!exists) {
      throw new HttpException(
        new CustomApiResponse(
          'error',
          'Token no reconocido o expirado. Solicita un nuevo enlace.',
          HttpStatus.UNAUTHORIZED,
        ),
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Si todo OK, seteamos la cookie de sesión
    res.cookie('token_dashboard', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    // Devolvemos al front la URL a la que debe navegar
    const frontend =
      this.config.get<string>('FRONTEND_URL') || 'http://localhost:4200';
    return new CustomApiResponse(
      'success',
      'Enlace válido. Redirigiendo al dashboard…',
      HttpStatus.OK,
      { redirectUrl: `${frontend}/dashboard` },
    );
  }
}
