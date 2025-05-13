import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PreguntasService } from '../services/preguntas.service';
import { CreatePreguntaDto } from '../dto/create-pregunta.dto';
import { UpdatePreguntaDto } from '../dto/update-pregunta.dto';

@Controller('preguntas')
export class PreguntasController {
  constructor(private readonly preguntasService: PreguntasService) {}

  @Post()
  create(@Body() createPreguntaDto: CreatePreguntaDto) {
    return this.preguntasService.create(createPreguntaDto);
  }

  @Get()
  findAll() {
    return this.preguntasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.preguntasService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePreguntaDto: UpdatePreguntaDto,
  ) {
    return this.preguntasService.update(+id, updatePreguntaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.preguntasService.remove(+id);
  }
}
