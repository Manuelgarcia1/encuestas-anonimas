import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import { TokenCookieGuard } from '../../auth/token-cookie.guard';
import { EncuestasService } from '../services/encuestas.service';
import { CreateEncuestaDto } from '../dto/create-encuesta.dto';
import { GetEncuestaDto } from '../dto/get-encuesta.dto';
import { ApiResponse } from '../../shared/response.dto';

@ApiTags('Encuestas')
@Controller('encuestas')
export class EncuestasController {
  constructor(private readonly encuestasService: EncuestasService) {}

  /**
   * Crea una nueva encuesta para el usuario logueado (cookie).
   */
  @Post()
  @UseGuards(TokenCookieGuard)
  @ApiOperation({ summary: 'Crear encuesta (requiere sesión)' })
  @SwaggerApiResponse({ status: 201, description: 'Encuesta creada con éxito' })
  @SwaggerApiResponse({ status: 401, description: 'No autorizado' })
  async createEncuesta(
    @Req() req: Request,
    @Body() dto: CreateEncuestaDto,
  ): Promise<ApiResponse> {
    const token = req.cookies['token_dashboard'];
    const encuesta = await this.encuestasService.crearEncuesta(dto, token);
    return new ApiResponse(
      'success',
      'Encuesta creada con éxito.',
      HttpStatus.CREATED,
      encuesta,
    );
  }

  /**
   * Lista las encuestas del creador logueado (cookie).
   */
  @Get()
  @UseGuards(TokenCookieGuard)
  @ApiOperation({ summary: 'Listar encuestas del creador (requiere sesión)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  @SwaggerApiResponse({
    status: 200,
    description: 'Encuestas encontradas o lista vacía',
  })
  @SwaggerApiResponse({ status: 401, description: 'No autorizado' })
  async findByCreador(
    @Req() req: Request,
    @Query() getEncuestaDto: GetEncuestaDto,
  ): Promise<ApiResponse> {
    const token = req.cookies['token_dashboard'];
    const { data, total, page, limit } =
      await this.encuestasService.obtenerEncuestasPorTokenCreador(
        token,
        getEncuestaDto,
      );
    const message = total
      ? 'Encuestas encontradas para el creador.'
      : 'Este creador no tiene encuestas creadas aún.';
    return new ApiResponse('success', message, HttpStatus.OK, data, {
      total,
      page,
      limit,
    });
  }

  /**
   * 🔐 Método privado para validar formato UUID del token_dashboard.
   * Lanza excepción si es inválido.
   */
  private validateToken(token: string): void {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(token)) {
      throw new HttpException(
        new ApiResponse(
          'error',
          'Token de creador inválido o inexistente.',
          HttpStatus.BAD_REQUEST,
        ),
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
