import { Band } from "src/modules/band/entities/band.entity";
import { Genre } from "src/modules/genre/entities/genre.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "vacancies" })
export class Vacancy {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({
        type: "varchar",
        length: 50,
        nullable: false,
    })
    name: string

    @Column({
        type: "text",
        nullable: false,
    })
    vacancyDescription: string

    @Column({
        default: "TRUE"
    })
    isOpen: boolean

    @Column({
        default: "NO IMAGE"
    })
    urlImage: string

    @Column({
        type: "varchar",
        length: 50,
        nullable: false,
    })
    owerType: string

    @ManyToMany(() => Genre, genre => genre.vacancies)
    @JoinTable({ name: 'vacancyGenres' })
    vacancyGenres: Genre[];

    // muchas vacantes {pertenecen} un usuario 
    @ManyToOne(() => User, (user) => user.vacancies, {
        nullable: false,          // pertenece SIEMPRE a un usuario
        onDelete: 'CASCADE',      // se borra al borrar el usuer 
        eager: false,
    })
    @JoinColumn({ name: 'ownerId' })
    ownerId: User;

     @ManyToOne(() => Band, (band) => band.bandVacancies, {
        nullable: true,          // pertenece NO SIEMPRE a una banda 
        onDelete: 'CASCADE',      // se borra al borrar la banda 
        eager: false,
    })
    @JoinColumn({ name: 'bandOwnerId' })
    bandOwnerId: Band[];
}
