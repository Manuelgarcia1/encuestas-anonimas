import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RespuestasAbiertasService } from '../services/respuestas-abiertas.service';
import { RespuestaAbiertaDto } from './../dto/create-respuestas-abierta.dto';
import { UpdateRespuestasAbiertaDto } from './../dto/update-respuestas-abierta.dto';

@Controller('respuestas-abiertas')
export class RespuestasAbiertasController {
  constructor(
    private readonly respuestasAbiertasService: RespuestasAbiertasService,
  ) {}
}
