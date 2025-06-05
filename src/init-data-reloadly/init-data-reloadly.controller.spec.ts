import { Test, TestingModule } from '@nestjs/testing';
import { InitDataReloadlyController } from './init-data-reloadly.controller';

describe('InitDataReloadlyController', () => {
  let controller: InitDataReloadlyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InitDataReloadlyController],
    }).compile();

    controller = module.get<InitDataReloadlyController>(InitDataReloadlyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
