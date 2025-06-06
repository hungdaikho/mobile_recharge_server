import { Test, TestingModule } from '@nestjs/testing';
import { ReloadlyController } from './reloadly.controller';

describe('ReloadlyController', () => {
  let controller: ReloadlyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReloadlyController],
    }).compile();

    controller = module.get<ReloadlyController>(ReloadlyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
