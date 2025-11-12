import { Band } from "src/domain/band/entities/band.entity";
import { User } from "src/domain/user/entities/user.entity";
import { Vacancy } from "src/domain/vacancy/entities/vacancy.entity";
import { Column, DeleteDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "genres" })
export class Genre {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        length: 30,
        nullable: false,
        unique: true,
    })
    name: string;

    @ManyToMany(() => User, (user) => user.genres)
    users: User[];

    @ManyToMany(() => Band, (band) => band.genres)
    bands: Band[];

    @ManyToMany(() => Vacancy, (vacancy) => vacancy.genres)
    vacancies: Vacancy[];

    @DeleteDateColumn({
        nullable: true
    })
    deletedAt: Date | null;
}
