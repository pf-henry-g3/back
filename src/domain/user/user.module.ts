import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Genre } from '../genre/entities/genre.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../role/entities/role.entity';
import { FileUploadModule } from '../../core/file-upload/file-upload.module';
import { UserVerificationService } from './userVerification.service';
import { AritstMusicalInstrument } from '../musical-instrument/entities/artist-musical-instrument.entity';
import { Band } from '../band/entities/band.entity';
import { BandMember } from '../band/entities/bandMember.entity';
import { MusicalInstrument } from '../musical-instrument/entities/musical-instrument.entity';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    AdminModule,
    TypeOrmModule.forFeature([User, Genre, Role, AritstMusicalInstrument, Band, BandMember, MusicalInstrument]),
    FileUploadModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserVerificationService],
  exports: [UserService, UserVerificationService],
})
export class UserModule { }
