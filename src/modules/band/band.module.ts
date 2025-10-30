import { Module } from '@nestjs/common';
import { BandController } from './band.controller';
import { BandsService } from './band.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Band } from './entities/band.entity';
import { User } from '../user/entities/user.entity';
import { Genre } from '../genre/entities/genre.entity';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Band, User, Genre]),
    FileUploadModule,
  ],
  controllers: [BandController],
  providers: [BandsService],
  exports: [BandsService],
})
export class BandModule { }
