import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateReservationDto {
  @IsNumber()
  @IsNotEmpty({ message: 'Concert ID is required' })
  concertId: number;

  @IsString()
  @IsNotEmpty({ message: 'User identifier is required' })
  userId: string;
}