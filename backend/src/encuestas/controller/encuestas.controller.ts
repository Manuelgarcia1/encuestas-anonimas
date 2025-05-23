import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
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

@ApiTags('Encuestas')
@Controller('encuestas')
export class EncuestasController {
  constructor(private readonly encuestasService: EncuestasService) {}

  // Crea una encuesta para el creador identificado
  @Post('creador/:token_dashboard')
  @ApiOperation({ summary: 'Crear una nueva encuesta para un creador' })
  @ApiParam({ name: 'token_dashboard', description: 'UUID del creador' })
  @SwaggerApiResponse({
    status: 201,
    description: 'Encuesta creada con éxito.',
  }) // <-- aquí
  async createEncuesta(
    @Param('token_dashboard', new ParseUUIDPipe()) token: string,
    @Body() dto: CreateEncuestaDto,
  ): Promise<ApiResponse> {
    const encuesta = await this.encuestasService.crearEncuesta(dto, token);
    return new ApiResponse(
      'success',
      'Encuesta creada.',
      HttpStatus.CREATED,
      encuesta,
    );
  }
  // Devuelve todas las encuestas de ese creador
  @Get('creador/:token_dashboard')
  @ApiOperation({ summary: 'Listar encuestas de un creador' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Encuestas obtenidas correctamente.',
  }) // <-- y aquí
  async findByCreador(
    @Param('token_dashboard', new ParseUUIDPipe()) token: string,
    @Query() query: GetEncuestaDto,
  ): Promise<ApiResponse> {
    const { data, total, page, limit } =
      await this.encuestasService.obtenerEncuestasPorTokenCreador(token, query);

    const message = total
      ? 'Encuestas encontradas para el creador.'
      : 'Este creador no tiene encuestas aún.';
    return new ApiResponse('success', message, HttpStatus.OK, data, {
      total,
      page,
      limit,
    });
  }
  //	Devuelve el token_respuesta para compartir
  @Get('/creador/:token_dashboard/:id_encuesta/token-participacion')
  @ApiOperation({
    summary: 'Obtener token_respuesta de una encuesta para participación',
  })
  @ApiParam({
    name: 'token_dashboard',
    description: 'UUID del creador de la encuesta',
  })
  @ApiParam({
    name: 'id_encuesta',
    description: 'ID numérico de la encuesta',
    type: Number,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Token de respuesta obtenido correctamente.',
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Encuesta no encontrada o no pertenece al creador.',
  })
  async getTokenRespuesta(
    @Param('token_dashboard', new ParseUUIDPipe()) tokenDashboard: string,
    @Param('id_encuesta', new ParseIntPipe()) idEncuesta: number,
  ): Promise<ApiResponse> {
    const tokenRespuesta = await this.encuestasService.obtenerTokenRespuesta(
      tokenDashboard,
      idEncuesta,
    );

    return new ApiResponse(
      'success',
      'Token de respuesta obtenido correctamente.',
      HttpStatus.OK,
      { token_respuesta: tokenRespuesta },
    );
  }

  //Dado el token v4 (enlace de participacion) devuelve nombre + preguntas + opciones
  @Get('/participacion/:token_respuesta')
  @ApiOperation({ summary: 'Obtener encuesta por token_respuesta (UUID v4)' })
  @ApiParam({
    name: 'token_respuesta',
    description: 'Token de respuesta (UUID v4)',
  })
  // @ApiParam({ name: 'token', description: 'Token de respuesta (UUID v4)' })
  async getEncuestaParaResponder(
    @Param('token_respuesta', new ParseUUIDPipe({ version: '4' }))
    tokenrespuesta: string,
  ): Promise<ApiResponse> {
    const encuesta =
      await this.encuestasService.findEncuestaByToken(tokenrespuesta);
    const payload = {
      id: encuesta.id,
      nombre: encuesta.nombre,
      preguntas: encuesta.preguntas.map((p) => ({
        id: p.id,
        texto: p.texto,
        tipo: p.tipo,
        opciones: p.opciones?.map((o) => ({ id: o.id, texto: o.texto })) || [],
      })),
    };
    return new ApiResponse(
      'success',
      'Encuesta cargada correctamente.',
      HttpStatus.OK,
      payload,
    );
  }  
}
