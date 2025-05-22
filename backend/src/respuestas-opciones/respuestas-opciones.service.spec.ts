import { Test, TestingModule } from '@nestjs/testing';
import { RespuestasOpcionesService } from './respuestas-opciones.service';

describe('RespuestasOpcionesService', () => {
  let service: RespuestasOpcionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RespuestasOpcionesService],
    }).compile();

    service = module.get<RespuestasOpcionesService>(RespuestasOpcionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
