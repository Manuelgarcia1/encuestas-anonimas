import { Test, TestingModule } from '@nestjs/testing';
import { EncuestasController } from './encuestas.controller';
import { EncuestasService } from './encuestas.service';

describe('EncuestasController', () => {
  let controller: EncuestasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EncuestasController],
      providers: [EncuestasService],
    }).compile();

    controller = module.get<EncuestasController>(EncuestasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
