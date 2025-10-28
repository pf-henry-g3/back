import { Users } from "src/modules/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "roles"})
export class Roles {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: String

    @ManyToOne(() => Users, (user) => user.roles)
    users: Users[]
}
