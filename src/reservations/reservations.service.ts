import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Reservation, ReservationStatus } from './entities/reservation.entity';
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

    const existingActive = await this.reservationRepository.findOne({
      where: {
        concert: { id: concertId },
        userId,
        status: ReservationStatus.RESERVED
      },
    });

    if (existingActive) {
      throw new BadRequestException('You already have an active reservation.');
    }

    const concert = await this.concertRepository.findOne({
      where: { id: concertId },
      relations: ['reservations'],
    });

    if (!concert) throw new NotFoundException('Concert not found');

    const occupiedSeats = concert.reservations.filter(
      r => r.status === ReservationStatus.RESERVED
    ).length;

    if (occupiedSeats >= concert.totalSeats) {
      throw new BadRequestException('Concert is full.');
    }

    const newReservation = this.reservationRepository.create({
      concert,
      userId,
      status: ReservationStatus.RESERVED,
    });

    return await this.reservationRepository.save(newReservation);
  }

  async findAll(userId?: string) {
    const query = this.reservationRepository.createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.concert', 'concert');

    if (userId) {
      query.where('reservation.userId = :userId', { userId });
    }

    query.orderBy('reservation.reservedAt', 'DESC');

    return await query.getMany();
  }

  async remove(id: number) {
    const reservation = await this.reservationRepository.findOne({ where: { id } });

    if (!reservation) throw new NotFoundException('Reservation not found');

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('Already cancelled');
    }

    reservation.status = ReservationStatus.CANCELLED;
    reservation.cancelledAt = new Date();

    return await this.reservationRepository.save(reservation);
  }

  async getAdminStats() {
    const totalConcerts = await this.concertRepository.find();
    const totalSeats = totalConcerts.reduce((acc, c) => acc + c.totalSeats, 0);

    const reserved = await this.reservationRepository.count({
      where: { status: ReservationStatus.RESERVED }
    });
    const cancelled = await this.reservationRepository.count({
      where: { status: ReservationStatus.CANCELLED }
    });

    return { totalSeats, reserved, cancelled };
  }
}