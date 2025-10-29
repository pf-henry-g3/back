import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { BandService } from '../band/band.service';
import { VacancyService } from '../vacancy/vacancy.service';
import { GenreService } from '../genre/genre.service';

@Injectable()
export class SeederService implements OnModuleInit{
    constructor(
        // private readonly userService: UserService,
        // private readonly bandService: BandService,
        private readonly genreService: GenreService,
        // private readonly vacancyService: VacancyService,
    ) {}

    async onModuleInit() {
        console.log(
            '📩 Ejecutando Seeder... Precargando en la base de datos...',
        )
        // await this.userService.seeder();
        // await this.bandService.seeder();
        await this.genreService.seederGenres();
        // await this.vacancyService.seeder();

        console.log('✅ Seeder finalizado correctamente.');
    }
}
