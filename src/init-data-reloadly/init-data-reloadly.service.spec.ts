import { Test, TestingModule } from '@nestjs/testing';
import { InitDataReloadlyService } from './init-data-reloadly.service';

describe('InitDataReloadlyService', () => {
  let service: InitDataReloadlyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InitDataReloadlyService],
    }).compile();

    service = module.get<InitDataReloadlyService>(InitDataReloadlyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
