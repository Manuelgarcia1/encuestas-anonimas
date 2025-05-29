// src/respuestas/respuestas.controller.ts
import {
  Body,
  Controller,
  Post,
  Param,
  HttpStatus,
  Get,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RespuestasService } from '../services/respuestas.service';
import { CreateRespuestaDto } from './../dto/create-respuesta.dto';
import {
  ApiTags,
  ApiResponse as SwaggerApiResponse,
  ApiParam,
  ApiOperation,
} from '@nestjs/swagger';
import { ApiResponse } from '../../shared/response.dto';

@ApiTags('Respuestas')
@Controller('respuestas')
export class RespuestasController {
  constructor(private readonly respuestasService: RespuestasService) {}

  @Post(':token_respuesta')
  @ApiParam({ name: 'token_respuesta', description: 'Token de participación' })
  @SwaggerApiResponse({
    status: 201,
    description: 'Respuestas guardadas correctamente',
  })
  async create(
    @Param('token_respuesta') tokenRespuesta: string,
    @Body() dto: CreateRespuestaDto,
  ) {
    await this.respuestasService.crearRespuesta(tokenRespuesta, dto);
    return {
      status: 'success',
      message: 'Respuestas registradas de forma anónima',
      statusCode: HttpStatus.CREATED,
    };
  }

  @Get('/resultados/:token_resultados')
  @ApiOperation({ summary: 'Obtener resultados de una encuesta' })
  @ApiParam({ name: 'token_resultados', description: 'Token de resultados' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Resultados obtenidos exitosamente',
    type: SwaggerApiResponse, // Añade esto para documentación Swagger
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Token de resultados inválido',
  })
  async obtenerResultados(
    @Param('token_resultados', new ParseUUIDPipe()) tokenResultados: string,
  ): Promise<ApiResponse> {
    const data =
      await this.respuestasService.obtenerResultados(tokenResultados);

    return new ApiResponse(
      'success',
      'Resultados obtenidos correctamente',
      HttpStatus.OK,
      data,
    );
  }
}
