import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateConcertDto {
  @IsString()
  @IsNotEmpty({ message: 'Concert name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string; 

  @IsInt()
  @Min(1, { message: 'Total seats must be at least 1' })
  totalSeats: number;
}