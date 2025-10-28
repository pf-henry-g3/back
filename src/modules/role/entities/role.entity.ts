import { Users } from "src/modules/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "roles" })
export class Roles {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        length: 30,
        nullable: false,
    })
    name: String

    @ManyToOne(() => Users, (user) => user.roles)
    users: Users[]
}
