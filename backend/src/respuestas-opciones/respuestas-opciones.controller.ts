import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RespuestasOpcionesService } from './respuestas-opciones.service';
import { CreateRespuestasOpcioneDto } from './dto/create-respuestas-opcione.dto';
import { UpdateRespuestasOpcioneDto } from './dto/update-respuestas-opcione.dto';

@Controller('respuestas-opciones')
export class RespuestasOpcionesController {
  constructor(private readonly respuestasOpcionesService: RespuestasOpcionesService) {}

  @Post()
  create(@Body() createRespuestasOpcioneDto: CreateRespuestasOpcioneDto) {
    return this.respuestasOpcionesService.create(createRespuestasOpcioneDto);
  }

  @Get()
  findAll() {
    return this.respuestasOpcionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.respuestasOpcionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRespuestasOpcioneDto: UpdateRespuestasOpcioneDto) {
    return this.respuestasOpcionesService.update(+id, updateRespuestasOpcioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.respuestasOpcionesService.remove(+id);
  }
}
