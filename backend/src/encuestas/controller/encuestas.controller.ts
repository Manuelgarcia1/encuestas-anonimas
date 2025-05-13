import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Body,
} from '@nestjs/common';
import { EncuestasService } from '../services/encuestas.service';
import { CreateEncuestaDto } from '../dto/create-encuesta.dto';
import { Encuesta } from '../entities/encuesta.entity';
import { ApiResponse } from '../../shared/response.dto';

@Controller('/encuestas')
export class EncuestasController {
  constructor(private encuestasService: EncuestasService) {}

  // Crear una encuesta
  @Post(':token_dashboard')
  async createEncuesta(
    @Param('token_dashboard') token: string,
    @Body() dto: CreateEncuestaDto,
  ) {
    try {
      const encuesta = await this.encuestasService.crearEncuesta(
        dto,
        token,
      );
      return new ApiResponse(
        'success',
        'Encuesta creada con éxito.',
        HttpStatus.CREATED,
        encuesta,
      );
    } catch (error) {
      // Manejo más adecuado de errores, lanzar BadRequestException para problemas de entrada
      throw new BadRequestException(
        new ApiResponse('error', error.message, HttpStatus.BAD_REQUEST),
      );
    }
  }

  // Obtener encuestas por token_dashboard
  @Get(':token_dashboard')
  async findByCreador(
    @Param('token_dashboard') token: string,
  ): Promise<ApiResponse<Encuesta[]>> {
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

    // Obtener las encuestas por token_dashboard
    const encuestas =
      await this.encuestasService.obtenerEncuestasPorTokenCreador(token);

    // Si no se encuentran encuestas, responder con mensaje adecuado
    return new ApiResponse(
      'success',
      encuestas.length
        ? 'Encuestas encontradas para el creador.'
        : 'Este creador no tiene encuestas creadas aún.',
      HttpStatus.OK,
      encuestas,
    );
  }
}
