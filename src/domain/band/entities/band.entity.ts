import { Genre } from "src/domain/genre/entities/genre.entity";
import { User } from "src/domain/user/entities/user.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
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

    @Column({
        type: 'varchar',
        length: 100,
        unique: true,
        nullable: false,
    })
    bandName: string;

    @Column({
        type: 'text',
        nullable: false,
    })
    bandDescription: string;

    @Column({
        type: 'date',
        nullable: false,
    })
    formationDate: Date;

    @Column({
        type: 'text',
        default: 'https://res.cloudinary.com/dgxzi3eu0/image/upload/v1761796743/NoImage_p0ke5q.avif',
        nullable: true,
    })
    urlImage: string;

    @Column({
        type: 'decimal',
        precision: 2,
        scale: 1,
        default: 0.0,
        nullable: true
    })
    averageRating: number;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: true
    })
    city: string;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: true
    })
    country: string;

    @Column({
        type: 'decimal',
        default: null,
    })
    latitude: number;

    @Column({
        type: 'decimal',
        default: null,
    })
    longitude: number;

    //Columnas de moderacion
    @Column({
        default: false,
        nullable: true,
    })
    isFlagged: boolean;

    @Column({
        type: 'text',
        nullable: true,
    })
    moderationReason: string;

    @DeleteDateColumn({
        nullable: true,
    })
    deletedAt: Date | null;

    //Relacion con Genre
    @ManyToMany(() => Genre, genre => genre.bands)
    @JoinTable({ name: 'bandGenres' })
    genres: Genre[];

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
