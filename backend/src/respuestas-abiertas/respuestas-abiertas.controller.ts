import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RespuestasAbiertasService } from './respuestas-abiertas.service';
import { CreateRespuestasAbiertaDto } from './dto/create-respuestas-abierta.dto';
import { UpdateRespuestasAbiertaDto } from './dto/update-respuestas-abierta.dto';

@Controller('respuestas-abiertas')
export class RespuestasAbiertasController {
  constructor(private readonly respuestasAbiertasService: RespuestasAbiertasService) {}

  @Post()
  create(@Body() createRespuestasAbiertaDto: CreateRespuestasAbiertaDto) {
    return this.respuestasAbiertasService.create(createRespuestasAbiertaDto);
  }

  @Get()
  findAll() {
    return this.respuestasAbiertasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.respuestasAbiertasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRespuestasAbiertaDto: UpdateRespuestasAbiertaDto) {
    return this.respuestasAbiertasService.update(+id, updateRespuestasAbiertaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.respuestasAbiertasService.remove(+id);
  }
}
