import { Test, TestingModule } from '@nestjs/testing';
import { CreadoresService } from './creadores.service';

describe('CreadoresService', () => {
  let service: CreadoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreadoresService],
    }).compile();

    service = module.get<CreadoresService>(CreadoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
