import { Module } from '@nestjs/common';
import { MusicalInstrumentService } from './musical-instrument.service';
import { MusicalInstrumentController } from './musical-instrument.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusicalInstrument } from './entities/musical-instrument.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([MusicalInstrument])
  ],
  controllers: [MusicalInstrumentController],
  providers: [MusicalInstrumentService],
})
export class MusicalInstrumentModule { }
