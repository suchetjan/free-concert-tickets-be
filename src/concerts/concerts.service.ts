import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';
import { Concert } from './entities/concert.entity';

@Injectable()
export class ConcertsService {
  constructor(
    @InjectRepository(Concert)
    private readonly concertRepository: Repository<Concert>,
  ) {}

  async create(createConcertDto: CreateConcertDto): Promise<Concert> {
    const concert = this.concertRepository.create(createConcertDto);
    return await this.concertRepository.save(concert);
  }

  async findAll(): Promise<Concert[]> {
    return await this.concertRepository.find();
  }

  async findOne(id: number): Promise<Concert> {
    const concert = await this.concertRepository.findOne({ where: { id } });
    if (!concert) {
      throw new NotFoundException(`Concert #${id} not found`);
    }
    return concert;
  }

  async update(id: number, updateConcertDto: UpdateConcertDto): Promise<Concert> {
    const concert = await this.concertRepository.preload({
      id: id,
      ...updateConcertDto,
    });
    if (!concert) {
      throw new NotFoundException(`Concert #${id} not found`);
    }
    return this.concertRepository.save(concert);
  }

  async remove(id: number): Promise<void> {
    const concert = await this.findOne(id);
    await this.concertRepository.remove(concert);
  }
}
