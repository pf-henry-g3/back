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
import { AdminModule } from '../admin/admin.module';
import { Application } from '../application/entities/application.entity';

@Module({
  imports: [
    UserModule,
    AdminModule,
    TypeOrmModule.forFeature([Vacancy, User, Genre, Role, Application]),
    FileUploadModule,
  ],
  controllers: [VacancyController],
  providers: [VacancyService],
  exports: [VacancyService],
})
export class VacancyModule { }
