import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Genre } from '../genre/entities/genre.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Band } from '../band/entities/band.entity';
import { BandMember } from '../band/entities/bandMember.entity';
import { Role } from '../role/entities/role.entity';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Genre, Band, BandMember, Role]),
    FileUploadModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
