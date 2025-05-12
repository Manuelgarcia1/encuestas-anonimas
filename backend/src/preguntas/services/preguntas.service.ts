import { Injectable } from '@nestjs/common';
import { CreatePreguntaDto } from '../dto/create-pregunta.dto';
import { UpdatePreguntaDto } from '../dto/update-pregunta.dto';

@Injectable()
export class PreguntasService {
  create(createPreguntaDto: CreatePreguntaDto) {
    return 'This action adds a new pregunta';
  }

  findAll() {
    return `This action returns all preguntas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pregunta`;
  }

  update(id: number, updatePreguntaDto: UpdatePreguntaDto) {
    return `This action updates a #${id} pregunta`;
  }

  remove(id: number) {
    return `This action removes a #${id} pregunta`;
  }
}
