import { Users } from "src/modules/user/entities/user.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "genres" })
export class Genres {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        length: 30,
        nullable: false,
    })
    name: String;

    @ManyToMany(() => Users, (user) => user.genres)
    users: Users[]

    //Relacion GeneroBanda
    //Relacion GeneroVacante
}
