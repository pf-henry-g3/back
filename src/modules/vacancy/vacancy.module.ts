import { Module } from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { VacancyController } from './vacancy.controller';
import { Vacancy } from './entities/vacancy.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Band } from '../band/entities/band.entity';
import { User } from '../user/entities/user.entity';
import { Genre } from '../genre/entities/genre.entity';
import { Role } from '../role/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vacancy, Band, User, Genre, Role])],
  controllers: [VacancyController],
  providers: [VacancyService],
})
export class VacancyModule { }
