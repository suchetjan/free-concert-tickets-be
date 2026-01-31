import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ConcertsService } from './concerts.service';
import { Concert } from './entities/concert.entity';

describe('ConcertsService', () => {
  let service: ConcertsService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertsService,
        { provide: getRepositoryToken(Concert), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ConcertsService>(ConcertsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a concert', async () => {
      const dto = { name: 'Concert 1', description: 'Desc', totalSeats: 100 };
      const concert = { id: 1, ...dto };

      mockRepository.create.mockReturnValue(concert);
      mockRepository.save.mockResolvedValue(concert);

      const result = await service.create(dto);
      expect(result).toEqual(concert);
    });
  });

  describe('findAll', () => {
    it('should return all concerts', async () => {
      const concerts = [{ id: 1, name: 'Concert 1' }];
      mockRepository.find.mockResolvedValue(concerts);

      const result = await service.findAll();
      expect(result).toEqual(concerts);
    });
  });

  describe('remove', () => {
    it('should remove a concert', async () => {
      const concert = { id: 1, name: 'Concert 1' };
      mockRepository.findOne.mockResolvedValue(concert);
      mockRepository.remove.mockResolvedValue(concert);

      const result = await service.remove(1);
      expect(mockRepository.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException if concert not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
