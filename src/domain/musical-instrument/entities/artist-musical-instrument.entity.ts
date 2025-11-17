import { User } from "src/domain/user/entities/user.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { MusicalInstrument } from "./musical-instrument.entity";

@Entity({ name: 'artist-musical-instrument' })
export class AritstMusicalInstrument {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => MusicalInstrument, (instrument) => instrument.artistMusicalInstrument, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'instrumentId' })
    instrument: MusicalInstrument;

    @ManyToOne(() => User, (user) => user.musicalInstruments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({
        type: 'varchar',
        length: 20,
        nullable: false,
    })
    level: string;

    @DeleteDateColumn({
        nullable: true,
    })
    deletedAt: Date | null;
}