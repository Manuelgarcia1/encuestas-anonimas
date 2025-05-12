import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OpcionesService } from './opciones.service';
import { CreateOpcioneDto } from './dto/create-opcione.dto';
import { UpdateOpcioneDto } from './dto/update-opcione.dto';

@Controller('opciones')
export class OpcionesController {
  constructor(private readonly opcionesService: OpcionesService) {}

  @Post()
  create(@Body() createOpcioneDto: CreateOpcioneDto) {
    return this.opcionesService.create(createOpcioneDto);
  }

  @Get()
  findAll() {
    return this.opcionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.opcionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOpcioneDto: UpdateOpcioneDto) {
    return this.opcionesService.update(+id, updateOpcioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.opcionesService.remove(+id);
  }
}
