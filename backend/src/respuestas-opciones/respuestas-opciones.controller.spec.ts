import { Test, TestingModule } from '@nestjs/testing';
import { RespuestasOpcionesController } from './respuestas-opciones.controller';
import { RespuestasOpcionesService } from './respuestas-opciones.service';

describe('RespuestasOpcionesController', () => {
  let controller: RespuestasOpcionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RespuestasOpcionesController],
      providers: [RespuestasOpcionesService],
    }).compile();

    controller = module.get<RespuestasOpcionesController>(RespuestasOpcionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
