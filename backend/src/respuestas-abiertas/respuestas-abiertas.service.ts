import { Injectable } from '@nestjs/common';
import { CreateRespuestasAbiertaDto } from './dto/create-respuestas-abierta.dto';
import { UpdateRespuestasAbiertaDto } from './dto/update-respuestas-abierta.dto';

@Injectable()
export class RespuestasAbiertasService {
  create(createRespuestasAbiertaDto: CreateRespuestasAbiertaDto) {
    return 'This action adds a new respuestasAbierta';
  }

  findAll() {
    return `This action returns all respuestasAbiertas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} respuestasAbierta`;
  }

  update(id: number, updateRespuestasAbiertaDto: UpdateRespuestasAbiertaDto) {
    return `This action updates a #${id} respuestasAbierta`;
  }

  remove(id: number) {
    return `This action removes a #${id} respuestasAbierta`;
  }
}
