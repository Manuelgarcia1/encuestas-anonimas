import { Injectable } from '@nestjs/common';
import { RespuestaOpcionDto } from './../dto/create-respuestas-opcione.dto';
import { UpdateRespuestasOpcioneDto } from './../dto/update-respuestas-opcione.dto';

@Injectable()
export class RespuestasOpcionesService {
  create(RespuestaOpcionDto: RespuestaOpcionDto) {
    return 'This action adds a new respuestasOpcione';
  }

  findAll() {
    return `This action returns all respuestasOpciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} respuestasOpcione`;
  }

  update(id: number, updateRespuestasOpcioneDto: UpdateRespuestasOpcioneDto) {
    return `This action updates a #${id} respuestasOpcione`;
  }

  remove(id: number) {
    return `This action removes a #${id} respuestasOpcione`;
  }
}
