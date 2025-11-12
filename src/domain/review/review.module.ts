import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadModule } from 'src/core/file-upload/file-upload.module';
import { User } from '../user/entities/user.entity';
import { Review } from './entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Review]),
    UserModule,
    FileUploadModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService],

})
export class ReviewModule { }
