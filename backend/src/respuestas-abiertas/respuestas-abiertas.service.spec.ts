import { Test, TestingModule } from '@nestjs/testing';
import { RespuestasAbiertasService } from './respuestas-abiertas.service';

describe('RespuestasAbiertasService', () => {
  let service: RespuestasAbiertasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RespuestasAbiertasService],
    }).compile();

    service = module.get<RespuestasAbiertasService>(RespuestasAbiertasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
