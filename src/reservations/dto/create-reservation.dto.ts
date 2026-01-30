import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateReservationDto {
  @IsNumber()
  @IsNotEmpty()
  concertId: number;

  @IsString()
  @IsNotEmpty({ message: 'User identifier is required' })
  userId: string;
}