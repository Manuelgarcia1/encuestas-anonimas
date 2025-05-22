import { Injectable } from '@nestjs/common';
import { CreateRespuestaDto } from './dto/create-respuesta.dto';
import { UpdateRespuestaDto } from './dto/update-respuesta.dto';

@Injectable()
export class RespuestasService {
  create(createRespuestaDto: CreateRespuestaDto) {
    return 'This action adds a new respuesta';
  }

  findAll() {
    return `This action returns all respuestas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} respuesta`;
  }

  update(id: number, updateRespuestaDto: UpdateRespuestaDto) {
    return `This action updates a #${id} respuesta`;
  }

  remove(id: number) {
    return `This action removes a #${id} respuesta`;
  }
}
