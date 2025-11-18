import { Module } from '@nestjs/common';
import { BandController } from './band.controller';
import { BandsService } from './band.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Band } from './entities/band.entity';
import { User } from '../user/entities/user.entity';
import { Genre } from '../genre/entities/genre.entity';
import { FileUploadModule } from '../../core/file-upload/file-upload.module';
import { BandMember } from './entities/bandMember.entity';
import { UserModule } from '../user/user.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    UserModule,
    AdminModule,
    TypeOrmModule.forFeature([Band, User, Genre, BandMember]),
    FileUploadModule,
  ],
  controllers: [BandController],
  providers: [BandsService],
  exports: [BandsService],
})
export class BandModule { }
