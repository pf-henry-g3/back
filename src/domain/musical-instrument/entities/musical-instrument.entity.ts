import { Column, DeleteDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AritstMusicalInstrument } from "./artist-musical-instrument.entity";
import { Vacancy } from "src/domain/vacancy/entities/vacancy.entity";

@Entity({ name: 'musical-instrument' })
export class MusicalInstrument {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        length: 30,
        nullable: false,
        unique: true,
    })
    name: string;

    @DeleteDateColumn({
        nullable: true,
    })
    deletedAt: Date | null;

    @OneToMany(() => AritstMusicalInstrument, (artistMusicalInstrument) => artistMusicalInstrument.user, {
        cascade: true,
    })
    artistMusicalInstrument: AritstMusicalInstrument[];

    @ManyToMany(() => Vacancy, vacancy => vacancy.instruments)
    vacancies: Vacancy[];
}
