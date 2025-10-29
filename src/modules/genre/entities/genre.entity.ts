import { Band } from "src/modules/band/entities/band.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Vacancy } from "src/modules/vacancy/entities/vacancy.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "genres" })
export class Genre {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        length: 30,
        nullable: false,
    })
    name: string;

    @ManyToMany(() => User, (user) => user.genres)
    users: User[];

    @ManyToMany(() => Band, (band) => band.bandGenre)
    bands: Band[];

    @ManyToMany(() => Vacancy, (vacancy) => vacancy.vacancyGenres)
    vacancies: Vacancy[];
}
