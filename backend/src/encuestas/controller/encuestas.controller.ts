import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { EncuestasService } from '../services/encuestas.service';
import { CreateEncuestaDto } from '../dto/create-encuesta.dto';
import { GetEncuestaDto } from '../dto/get-encuesta.dto';
import { ApiResponse } from '../../shared/response.dto';

ApiTags('Encuestas');
@Controller('/encuestas')
export class EncuestasController {
  constructor(private readonly encuestasService: EncuestasService) {}

  /**
   * Crea una nueva encuesta para un creador identificado por su token.
   */
  @Post(':token_dashboard')
  @ApiOperation({ summary: 'Crear una nueva encuesta para un creador' })
  @ApiParam({ name: 'token_dashboard', description: 'Token UUID del creador' })
  @SwaggerApiResponse({ status: 201, description: 'Encuesta creada con éxito' })
  @SwaggerApiResponse({ status: 400, description: 'Token inválido' })
  async createEncuesta(
    @Param('token_dashboard') token: string,
    @Body() dto: CreateEncuestaDto,
  ): Promise<ApiResponse> {
    // 1️⃣ Validamos que el token tenga formato UUID
    this.validateToken(token);

    // 2️⃣ Llamamos al Service para crear la encuesta
    const encuesta = await this.encuestasService.crearEncuesta(dto, token);

    // 3️⃣ Devolvemos ApiResponse con mensaje y datos de la encuesta
    return new ApiResponse(
      'success', // estado lógico
      'Encuesta creada con éxito.', // mensaje para el cliente
      HttpStatus.CREATED, // código HTTP
      encuesta, // payload con la encuesta creada
    );
  }

  /**
   * Lista las encuestas creadas por un usuario a partir de su token_dashboard.
   */
  @Get(':token_dashboard')
  @ApiOperation({
    summary: 'Listar encuestas de un creador por su token_dashboard',
  })
  @ApiParam({ name: 'token_dashboard', description: 'Token UUID del creador' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  @SwaggerApiResponse({
    status: 200,
    description: 'Encuestas encontradas o lista vacía',
  })
  async findByCreador(
    @Param('token_dashboard') token: string,
    @Query() getEncuestaDto: GetEncuestaDto,
  ): Promise<ApiResponse> {
    // 1️⃣ Validamos que el token tenga formato UUID
    this.validateToken(token);

    // 2️⃣ Llamamos al Service que devuelve las encuestas + info de paginación
    const { data, total, page, limit } =
      await this.encuestasService.obtenerEncuestasPorTokenCreador(
        token,
        getEncuestaDto,
      );

    // 3️⃣ Mensaje personalizado según si se encontraron encuestas o no
    const message = total
      ? 'Encuestas encontradas para el creador.'
      : 'Este creador no tiene encuestas creadas aún.';

    // 4️⃣ Devolvemos ApiResponse con datos y meta de paginación
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
