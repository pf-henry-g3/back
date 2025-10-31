import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Band } from '../band/entities/band.entity';
import { Vacancy } from '../vacancy/entities/vacancy.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Band, Vacancy, User])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule { }
