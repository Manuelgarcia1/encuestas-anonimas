import { Test, TestingModule } from '@nestjs/testing';
import { EncuestasService } from './encuestas.service';

describe('EncuestasService', () => {
  let service: EncuestasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncuestasService],
    }).compile();

    service = module.get<EncuestasService>(EncuestasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
