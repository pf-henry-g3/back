import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Band } from "./band.entity";
import { User } from "src/modules/user/entities/user.entity";

@Entity('bandMembers')
export class BandMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Band, (band) => band.bandMembers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'bandId' })
    band: Band;

    @ManyToOne(() => User, (user) => user.meberships, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'date' })
    entryDate: Date;

    @Column({
        type: 'date',
        nullable: true,
    })
    departureDate: Date | null;
}