import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { UserModule } from '../../domain/user/user.module';
import { BandModule } from '../../domain/band/band.module';
import { GenreModule } from '../../domain/genre/genre.module';
import { RoleModule } from '../../domain/role/role.module';
import { VacancyModule } from '../../domain/vacancy/vacancy.module';

@Module({
  imports: [
    UserModule,
    BandModule,
    GenreModule,
    RoleModule,
    VacancyModule
  ],
  providers: [SeederService]
})
export class SeederModule { }
