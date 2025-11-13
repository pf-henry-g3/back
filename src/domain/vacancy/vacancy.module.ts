import { Module } from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { VacancyController } from './vacancy.controller';
import { Vacancy } from './entities/vacancy.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Genre } from '../genre/entities/genre.entity';
import { Role } from '../role/entities/role.entity';
import { FileUploadModule } from '../../core/file-upload/file-upload.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([Vacancy, User, Genre, Role]),
    FileUploadModule,
  ],
  controllers: [VacancyController],
  providers: [VacancyService],
  exports: [VacancyService],
})
export class VacancyModule { }
