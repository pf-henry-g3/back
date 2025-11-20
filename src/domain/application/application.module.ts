import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Vacancy } from '../vacancy/entities/vacancy.entity';

@Module({
    imports: [

      TypeOrmModule.forFeature([User, Vacancy]),

    ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule { }
