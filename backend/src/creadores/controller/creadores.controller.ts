// src/creadores/creadores.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse as SwaggerApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CreadoresService } from '../services/creadores.service';
import { CreateCreadorDto } from '../dto/create-creador.dto';
import { ApiResponse as CustomApiResponse } from '../../shared/response.dto';

@ApiTags('Creadores')
@Controller('creadores')
export class CreadoresController {
  constructor(private readonly creadoresService: CreadoresService) {}

  // ────────────────────────────────────────────────────────────────
  // 1️⃣ POST /creadores → envía el magic link por email
  // ────────────────────────────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar enlace de acceso al dashboard',
    description:
      'Envía un email con el magic link; si es la primera vez, retorna el token en la respuesta.',
  })
  @ApiBody({ type: CreateCreadorDto })
  @SwaggerApiResponse({
    status: 200,
    description: 'Si user nuevo → data: { token }. Si ya existía → data vacía.',
  })
  async requestAccess(
    @Body() dto: CreateCreadorDto,
  ): Promise<CustomApiResponse<{ token?: string }>> {
    const { created, token } = await this.creadoresService.requestAccess(
      dto.email,
    );
    const message = created
      ? 'Usuario registrado. Revisa tu email para acceder al dashboard…'
      : 'Ya registrado. Revisa tu email para acceder al dashboard.';
    const data = created ? { token } : undefined;
    return new CustomApiResponse('success', message, HttpStatus.OK, data);
  }

  // ────────────────────────────────────────────────────────────────
  // 2️⃣ GET /creadores/ingresar/:token → setea session-cookie y redirige
  // ────────────────────────────────────────────────────────────────
  @Get('ingresar/:token')
  @ApiOperation({ summary: 'Setea cookie y redirige al frontend' })
  @ApiParam({ name: 'token', description: 'UUID del creador' })
  async ingresarConToken(@Param('token') token: string, @Res() res: Response) {
    const isValid = await this.creadoresService.findByToken(token);
    if (!isValid) {
      return res.status(HttpStatus.BAD_REQUEST).send('Token inválido');
    }

    // — session cookie: dura hasta que el navegador cierra —
    res.cookie('token_dashboard', token, {
      httpOnly: true,
      secure: false, // en prod con HTTPS = true
      sameSite: 'lax',
      path: '/', // disponible en toda la API
      // NO maxAge ni expires → session cookie
    });

    return res.redirect('http://localhost:4200/dashboard');
  }

  // ────────────────────────────────────────────────────────────────
  // 3️⃣ (Opcional) GET /creadores/logout → limpia la cookie
  // ────────────────────────────────────────────────────────────────
  @Get('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('token_dashboard', { path: '/' });
    return res.redirect('http://localhost:4200/');
  }
}
