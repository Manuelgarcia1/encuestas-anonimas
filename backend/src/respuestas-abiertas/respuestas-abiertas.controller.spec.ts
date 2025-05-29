import { Test, TestingModule } from '@nestjs/testing';
import { RespuestasAbiertasController } from './respuestas-abiertas.controller';
import { RespuestasAbiertasService } from './respuestas-abiertas.service';

describe('RespuestasAbiertasController', () => {
  let controller: RespuestasAbiertasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RespuestasAbiertasController],
      providers: [RespuestasAbiertasService],
    }).compile();

    controller = module.get<RespuestasAbiertasController>(RespuestasAbiertasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
