import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Concert } from '../../concerts/entities/concert.entity';

export enum ReservationStatus {
  RESERVED = 'reserved',
  CANCELLED = 'cancelled',
}

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  reservedAt: Date;

  @Column({
    type: 'simple-enum',
    enum: ReservationStatus,
    default: ReservationStatus.RESERVED,
  })
  status: ReservationStatus;

  @Column({ type: 'datetime', nullable: true })
  cancelledAt: Date;

  @ManyToOne(() => Concert, (concert) => concert.reservations, { onDelete: 'CASCADE' })
  concert: Concert;
}