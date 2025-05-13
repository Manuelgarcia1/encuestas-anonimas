import { Injectable } from '@nestjs/common';
import { CreateOpcioneDto } from './../dto/create-opcione.dto';
import { UpdateOpcioneDto } from './../dto/update-opcione.dto';

@Injectable()
export class OpcionesService {
  create(createOpcioneDto: CreateOpcioneDto) {
    return 'This action adds a new opcione';
  }

  findAll() {
    return `This action returns all opciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} opcione`;
  }

  update(id: number, updateOpcioneDto: UpdateOpcioneDto) {
    return `This action updates a #${id} opcione`;
  }

  remove(id: number) {
    return `This action removes a #${id} opcione`;
  }
}
