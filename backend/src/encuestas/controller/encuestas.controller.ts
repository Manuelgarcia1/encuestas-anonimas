import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { EncuestasService } from '../services/encuestas.service';
import { CreateEncuestaDto } from '../dto/create-encuesta.dto';
import { Encuesta } from '../entities/encuesta.entity';

@Controller('/encuestas')
export class EncuestasController {
  constructor(private encuestasService: EncuestasService) {}

  @Post(':token_dashboard')
  async createEncuesta(
    @Param('token_dashboard') token: string,
    @Body() dto: CreateEncuestaDto,
  ): Promise<Encuesta> {
    return this.encuestasService.crearEncuesta(dto.nombre, token);
  }

  @Get(':token_dashboard')
  async findByCreador(
    @Param('token_dashboard') token: string,
  ): Promise<Encuesta[]> {
    return this.encuestasService.obtenerEncuestasPorTokenCreador(token);
  }
}
