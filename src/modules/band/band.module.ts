import { Module } from '@nestjs/common';
import { BandController } from './band.controller';
import { BandsService } from './band.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Band } from './entities/band.entity';
import { User } from '../user/entities/user.entity';
import { Genre } from '../genre/entities/genre.entity';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { BandMember } from './entities/bandMember.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TypeOrmModule.forFeature([Band, User, Genre, BandMember]),
    FileUploadModule,
  ],
  controllers: [BandController],
  providers: [BandsService],
  exports: [BandsService],
})
export class BandModule { }
