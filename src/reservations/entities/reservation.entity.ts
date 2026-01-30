import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Concert } from '../../concerts/entities/concert.entity';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string; 

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  reservedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'datetime', nullable: true })
  cancelledAt: Date;

  @ManyToOne(() => Concert, (concert) => concert.reservations, { onDelete: 'CASCADE' })
  concert: Concert;
}