import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RespuestasOpcionesService } from './respuestas-opciones.service';
import { RespuestaOpcionDto } from './dto/create-respuestas-opcione.dto';
import { UpdateRespuestasOpcioneDto } from './dto/update-respuestas-opcione.dto';

@Controller('respuestas-opciones')
export class RespuestasOpcionesController {}
