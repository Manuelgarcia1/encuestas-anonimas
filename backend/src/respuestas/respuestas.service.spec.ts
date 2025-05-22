import { Test, TestingModule } from '@nestjs/testing';
import { RespuestasService } from './respuestas.service';

describe('RespuestasService', () => {
  let service: RespuestasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RespuestasService],
    }).compile();

    service = module.get<RespuestasService>(RespuestasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
