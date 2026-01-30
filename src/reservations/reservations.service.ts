import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Reservation } from './entities/reservation.entity';
import { Concert } from '../concerts/entities/concert.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Concert)
    private readonly concertRepository: Repository<Concert>,
  ) {}

  async create(createReservationDto: CreateReservationDto) {
    const { concertId, userId } = createReservationDto;

    const concert = await this.concertRepository.findOne({ 
      where: { id: concertId },
      relations: ['reservations'] 
    });
    if (!concert) throw new NotFoundException('Concert not found');

    const existingReservation = await this.reservationRepository.findOne({
      where: { userId, concert: { id: concertId } }
    });
    if (existingReservation) {
      throw new BadRequestException('You have already reserved a seat for this concert');
    }

    if (concert.reservations.length >= concert.totalSeats) {
      throw new BadRequestException('This concert is sold out');
    }

    const reservation = this.reservationRepository.create({
      userId,
      concert
    });

    return await this.reservationRepository.save(reservation);
  }

  async findAll(userId?: string) {
    if (userId) {
      return await this.reservationRepository.find({ 
        where: { userId }, 
        relations: ['concert'] 
      });
    }
    return await this.reservationRepository.find({ relations: ['concert'] });
  }

  async remove(id: number) {
    const reservation = await this.reservationRepository.findOne({ where: { id } });
    if (!reservation) throw new NotFoundException('Reservation not found');
    return await this.reservationRepository.remove(reservation);
  }
}