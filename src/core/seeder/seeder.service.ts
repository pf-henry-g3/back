import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from '../../domain/user/user.service';
import { BandsService } from '../../domain/band/band.service';
import { VacancyService } from '../../domain/vacancy/vacancy.service';
import { GenreService } from '../../domain/genre/genre.service';
import { RoleService } from '../../domain/role/role.service';

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
