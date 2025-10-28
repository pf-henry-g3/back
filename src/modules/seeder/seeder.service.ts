import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { BandService } from '../band/band.service';
import { VacancyService } from '../vacancy/vacancy.service';

@Injectable()
export class SeederService implements OnModuleInit{
    constructor(
        private readonly userService: UserService,
        private readonly bandService: BandService,
        // private readonly genreService: GenreService,
        private readonly vacancyService: VacancyService,
    ) {}

    onModuleInit() {
        console.log(
            '📩 Ejecutando Seeder... Precargando productos y categorías en la base de datos...',
        )
        // await this.userService.seeder();
        // await this.bandService.seeder();
        // await this.genreService.seeder();
        // await this.vacancyService.seeder();

        console.log('✅ Seeder finalizado correctamente.');
    }
}
