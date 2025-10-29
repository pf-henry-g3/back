import { Injectable } from '@nestjs/common';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { GenreService } from '../genre/genre.service';
import { Genre } from '../genre/entities/genre.entity';
import { Repository } from 'typeorm';
import { Vacancy } from './entities/vacancy.entity';

@Injectable()
export class VacancyService {
  constructor(
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<User>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Genre)
    private readonly genresRepository: Repository<Genre>,

  ) { }

  create(createVacancyDto: CreateVacancyDto) {
    return 'This action adds a new vacancy';
  }

  async findAll(page: number = 1, limit: number = 30) {
    const [vacancies, total] = await this.vacancyRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: vacancies,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async findOne(id: string) {
    return await this.vacancyRepository.findOne({ where: { id: id } })
  }

  update(id: number, updateVacancyDto: UpdateVacancyDto) {
    return `This action updates a #${id} vacancy`;
  }

  remove(id: number) {
    return `This action removes a #${id} vacancy`;
  }
}
