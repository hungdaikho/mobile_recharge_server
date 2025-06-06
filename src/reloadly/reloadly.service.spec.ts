import { Test, TestingModule } from '@nestjs/testing';
import { ReloadlyService } from './reloadly.service';

describe('ReloadlyService', () => {
  let service: ReloadlyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReloadlyService],
    }).compile();

    service = module.get<ReloadlyService>(ReloadlyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
