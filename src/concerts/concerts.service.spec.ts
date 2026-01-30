import { Test, TestingModule } from '@nestjs/testing';
import { ConcertsService } from './concerts.service';

describe('ConcertsService', () => {
  let service: ConcertsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ConcertsService, useValue: {} }, // mock service
      ],
    }).compile();

    service = module.get<ConcertsService>(ConcertsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
