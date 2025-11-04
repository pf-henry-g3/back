import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { BandsService } from '../band/band.service';
import { VacancyService } from '../vacancy/vacancy.service';
import { GenreService } from '../genre/genre.service';
import { RoleService } from '../role/role.service';

@Injectable()
export class SeederService implements OnModuleInit {
    constructor(
        private readonly genreService: GenreService,
        private readonly roleService: RoleService,
        private readonly userService: UserService,
        private readonly bandService: BandsService,
        private readonly vacancyService: VacancyService,
    ) { }

    async onModuleInit() {
        console.log(
            '📩 Ejecutando Seeder... Precargando en la base de datos...',
        )
        await this.genreService.seederGenres();
        console.log("🎈 Generos precargados correctamente");
        await this.roleService.seederRoles();
        console.log("🎈 Roles precargados correctamente");
        await this.userService.seedUsers();
        console.log("🎈 Usuarios precargados correctamente");
        await this.bandService.seederBandas();
        console.log("🎈 Bandas precargadas correctamente");
        await this.vacancyService.seederVacancies();
        console.log("🎈 Vacantes precargadas correctamente");

        console.log('✅ Seeder finalizado correctamente.');
    }
}
