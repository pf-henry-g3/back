import { Users } from "src/modules/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "Vacancies" })
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
        length: 50,
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
    vacancyImage: string

    @Column({
        type: "text",
        length: 50,
        nullable: false,
    })
    owerType: string

    // muchas vacantes {pertenecen} un usuario 
    @ManyToOne(() => Users, (u) => u.vacancies, {
        nullable: false,          // pertenece SIEMPRE a un usuario
        onDelete: 'CASCADE',      // se borra al borrar el usuer 
        eager: false,
    })
    @JoinColumn({ name: 'owerId' })
    owerId: Users;
}
