import { Test, TestingModule } from '@nestjs/testing';
import { CreadoresController } from './creadores.controller';

describe('CreadoresController', () => {
  let controller: CreadoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreadoresController],
    }).compile();

    controller = module.get<CreadoresController>(CreadoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
