import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { Concert } from '../concerts/entities/concert.entity';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let mockReservationRepository: any;
  let mockConcertRepository: any;

  beforeEach(async () => {
    mockReservationRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
      count: jest.fn(),
    };

    mockConcertRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: getRepositoryToken(Reservation), useValue: mockReservationRepository },
        { provide: getRepositoryToken(Concert), useValue: mockConcertRepository },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a reservation successfully', async () => {
      const dto = { concertId: 1, userId: 'user1' };
      const concert = { id: 1, totalSeats: 10, reservations: [] };
      const reservation = { id: 1, ...dto, status: ReservationStatus.RESERVED };

      mockReservationRepository.findOne.mockResolvedValue(null);
      mockConcertRepository.findOne.mockResolvedValue(concert);
      mockReservationRepository.create.mockReturnValue(reservation);
      mockReservationRepository.save.mockResolvedValue(reservation);

      const result = await service.create(dto);
      expect(result).toEqual(reservation);
      expect(mockReservationRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user already has active reservation', async () => {
      const dto = { concertId: 1, userId: 'user1' };
      mockReservationRepository.findOne.mockResolvedValue({ id: 1, status: ReservationStatus.RESERVED });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if concert not found', async () => {
      const dto = { concertId: 999, userId: 'user1' };
      mockReservationRepository.findOne.mockResolvedValue(null);
      mockConcertRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if concert is full', async () => {
      const dto = { concertId: 1, userId: 'user1' };
      const concert = { 
        id: 1, 
        totalSeats: 2, 
        reservations: [
          { status: ReservationStatus.RESERVED },
          { status: ReservationStatus.RESERVED },
        ] 
      };

      mockReservationRepository.findOne.mockResolvedValue(null);
      mockConcertRepository.findOne.mockResolvedValue(concert);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all reservations', async () => {
      const reservations = [{ id: 1, userId: 'user1' }];
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(reservations),
      };

      mockReservationRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll();
      expect(result).toEqual(reservations);
    });

    it('should return reservations filtered by userId', async () => {
      const reservations = [{ id: 1, userId: 'user1' }];
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(reservations),
      };

      mockReservationRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll('user1');
      expect(result).toEqual(reservations);
      expect(queryBuilder.where).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should cancel a reservation', async () => {
      const reservation = { id: 1, status: ReservationStatus.RESERVED, cancelledAt: null };
      mockReservationRepository.findOne.mockResolvedValue(reservation);
      mockReservationRepository.save.mockResolvedValue({
        ...reservation,
        status: ReservationStatus.CANCELLED,
      });

      const result = await service.remove(1);
      expect(result.status).toBe(ReservationStatus.CANCELLED);
      expect(mockReservationRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if reservation not found', async () => {
      mockReservationRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if already cancelled', async () => {
      const reservation = { id: 1, status: ReservationStatus.CANCELLED };
      mockReservationRepository.findOne.mockResolvedValue(reservation);

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAdminStats', () => {
    it('should return admin statistics', async () => {
      const concerts = [{ totalSeats: 100 }, { totalSeats: 50 }];
      mockConcertRepository.find.mockResolvedValue(concerts);
      mockReservationRepository.count.mockResolvedValueOnce(75); // reserved
      mockReservationRepository.count.mockResolvedValueOnce(10); // cancelled

      const result = await service.getAdminStats();
      expect(result).toEqual({ totalSeats: 150, reserved: 75, cancelled: 10 });
    });
  });
});
