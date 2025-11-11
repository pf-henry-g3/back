import { Band } from "src/domain/band/entities/band.entity";
import { Genre } from "src/domain/genre/entities/genre.entity";
import { User } from "src/domain/user/entities/user.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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
        default: "https://res.cloudinary.com/dgxzi3eu0/image/upload/v1761796743/NoImage_p0ke5q.avif",
        nullable: false,
    })
    urlImage: string

    // @Column({
    //     type: "varchar",
    //     length: 50,
    //     nullable: false,
    // })
    // owerType: string

    @ManyToMany(() => Genre, genre => genre.vacancies, { eager: true })
    @JoinTable({ name: 'vacancyGenres' })
    genres: Genre[];

    // muchas vacantes {pertenecen} un usuario 
    @ManyToOne(() => User, (user) => user.vacancies, {
        nullable: false,          // pertenece SIEMPRE a un usuario
        onDelete: 'CASCADE',      // se borra al borrar el usuer 
        eager: false,
    })
    @JoinColumn({ name: 'ownerId' })
    owner: User;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;

    // @ManyToOne(() => Band, (band) => band.bandVacancies, {
    //     nullable: false,          // pertenece SIEMPRE a un usuario
    //     onDelete: 'CASCADE',      // se borra al borrar la banda 
    //     eager: false,
    // })
    // @JoinColumn({ name: 'bandOwnerId' })
    // bandOwnerId: Band[];
}
