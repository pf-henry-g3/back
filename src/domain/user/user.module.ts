import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Genre } from '../genre/entities/genre.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../role/entities/role.entity';
import { FileUploadModule } from '../../core/file-upload/file-upload.module';
import { UserVerificationService } from './userVerification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Genre, Role]),
    FileUploadModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserVerificationService],
  exports: [UserService, UserVerificationService],
})
export class UserModule { }
