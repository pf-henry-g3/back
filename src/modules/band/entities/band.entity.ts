import { Genre } from "src/modules/genre/entities/genre.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Vacancy } from "src/modules/vacancy/entities/vacancy.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { BandMember } from "./bandMember.entity";

@Entity('bands')
export class Band {
    // id
    @PrimaryGeneratedColumn('uuid')
    id: string;

    //Relacion con User (Lider de Banda)
    @ManyToOne(() => User, (user) => user.leaderOf, {
        nullable: false,
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'leaderId' })
    leader: User;

    @Column({ type: 'varchar', length: 100, unique: true })
    bandName: string;

    @Column({ type: 'text' })
    bandDescription: string;

    @Column({ type: 'date' })
    formationDate: Date;

    @Column({ type: 'text', default: 'https://res.cloudinary.com/dgxzi3eu0/image/upload/v1761796743/NoImage_p0ke5q.avif' })
    urlImage: string;

    //Relacion con Genre
    @ManyToMany(() => Genre, genre => genre.bands)
    @JoinTable({ name: 'bandGenres' })
    bandGenre: Genre[];

    //Relacion con User (miembros)
    @OneToMany(() => BandMember, (member) => member.band, {
        cascade: true,
    })
    bandMembers: BandMember[];

    // @OneToMany(() => BandEvent, bandEvent => bandEvent.band)
    // bandEvents: BandEvents[];

    // //Relacion con Vacancy
    // @OneToMany(() => Vacancy, vacancy => vacancy.bandOwnerId)
    // bandVacancies: Vacancy[];

}

//Obersvaciones:
//Cambie el nombre de la columna name por bandName para evitar conflictos y mantener coherencia
//Lo mismo hice con EventsBand por BandEvent 
