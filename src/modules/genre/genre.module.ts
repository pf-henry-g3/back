import { Module } from '@nestjs/common';
import { GenreService } from './genre.service';
import { GenreController } from './genre.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TypeOrmModule.forFeature([Genre])
  ],
  controllers: [GenreController],
  providers: [GenreService],
  exports: [GenreService],
})
export class GenreModule { }
