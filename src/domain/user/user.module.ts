import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Genre } from '../genre/entities/genre.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Band } from '../band/entities/band.entity';
import { BandMember } from '../band/entities/bandMember.entity';
import { Role } from '../role/entities/role.entity';
import { FileUploadModule } from '../../core/file-upload/file-upload.module';
import { MailerConfigModule } from '../../core/mailer/mailer.module';
import { UserVerificationService } from './userVerification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Genre, Band, BandMember, Role]),
    FileUploadModule,
    MailerConfigModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserVerificationService],
  exports: [UserService, UserVerificationService],
})
export class UserModule { }
