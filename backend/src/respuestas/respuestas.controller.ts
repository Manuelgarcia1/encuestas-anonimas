// src/respuestas/respuestas.controller.ts
import { Body, Controller, Post, Param, HttpStatus } from '@nestjs/common';
import { RespuestasService } from './respuestas.service';
import { CreateRespuestaDto } from './dto/create-respuesta.dto';
import { ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Respuestas')
@Controller('respuestas')
export class RespuestasController {
  constructor(private readonly respuestasService: RespuestasService) {}

  @Post(':token_respuesta')
  @ApiParam({ name: 'token_respuesta', description: 'Token de participación' })
  @ApiResponse({ status: 201, description: 'Respuestas guardadas correctamente' })
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
}
