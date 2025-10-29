import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { UserModule } from '../user/user.module';
import { BandModule } from '../band/band.module';
import { GenreModule } from '../genre/genre.module';
import { RoleModule } from '../role/role.module';
import { VacancyModule } from '../vacancy/vacancy.module';

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
export class SeederModule {}
