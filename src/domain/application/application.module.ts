import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { Vacancy } from '../vacancy/entities/vacancy.entity';
import { User } from 'mercadopago';

@Module({
   imports: [TypeOrmModule.forFeature([Application, Vacancy, User])],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule {}
