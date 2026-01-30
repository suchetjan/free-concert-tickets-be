import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Concert } from '../concerts/entities/concert.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Concert)
    private concertRepository: Repository<Concert>,
  ) { }

  async create(createReservationDto: CreateReservationDto) {
    const { concertId, userId } = createReservationDto;

    const existing = await this.reservationRepository.findOne({
      where: {
        concert: { id: concertId },
        userId,
        isDeleted: false
      },
    });

    if (existing) {
      throw new BadRequestException('You have already reserved a seat for this concert.');
    }

    const concert = await this.concertRepository.findOne({
      where: { id: concertId },
      relations: ['reservations'],
    });

    if (!concert) {
      throw new NotFoundException('Concert not found');
    }

    const activeReservations = concert.reservations.filter(r => !r.isDeleted);

    if (activeReservations.length >= concert.totalSeats) {
      throw new BadRequestException('No seats available.');
    }

    const reservation = this.reservationRepository.create({
      concert,
      userId,
    });

    return await this.reservationRepository.save(reservation);
  }

  async findAll(userId?: string) {
    const query = this.reservationRepository.createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.concert', 'concert')
      .where('reservation.isDeleted = :isDeleted', { isDeleted: false });

    if (userId) {
      query.andWhere('reservation.userId = :userId', { userId });
    }

    return await query.getMany();
  }

  async countCancelled() {
    return await this.reservationRepository.count({
      where: { isDeleted: true }
    });
  }

  async remove(id: number) {
    const reservation = await this.reservationRepository.findOne({ where: { id } });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.isDeleted) {
      throw new BadRequestException('Reservation is already cancelled');
    }

    reservation.isDeleted = true;
    reservation.cancelledAt = new Date();

    return await this.reservationRepository.save(reservation);
  }

  async getAdminStats() {
    const totalConcerts = await this.concertRepository.find({ relations: ['reservations'] });

    const totalSeats = totalConcerts.reduce((acc, c) => acc + c.totalSeats, 0);
    const reserved = await this.reservationRepository.count({ where: { isDeleted: false } });
    const cancelled = await this.reservationRepository.count({ where: { isDeleted: true } });

    return { totalSeats, reserved, cancelled };
  }
}