import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Genre } from '../genre/entities/genre.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Band } from '../band/entities/band.entity';
import { BandMember } from '../band/entities/bandMember.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Genre, Band, BandMember])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
