import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('bands')
export class Band {
    // id
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @ManyToOne(() => Artist, artist => artist.bands)
    leaderid: Artist;

    @Column({ type: 'varchar', length: 100 , unique: true})
    bandName: string;    

    @Column({ type: 'text' })
    bandDescription: string;

    @Column({ type: 'date' })
    formationDate: Date;

    @Column({ type: 'varchar', length: 255 })
    bandImage: string;

    @ManyToMany(() => Genre, genre => genre.bands)
    @JoinTable()
    bandGenre: Genre[];

    @OneToMany(() => BandMember, bandMember => bandMember.band)
    bandMembers: BandMember[];

    @OneToMany(() => BandEvent, bandEvent => bandEvent.band)
    bandEvents: BandEvent[];

    @OneToMany(() => Vacancy, vacancy => vacancy.band)
    bandVacancies: Vacancy[];

}

//Obersvaciones:
//Cambie el nombre de la columna name por bandName para evitar conflictos y mantener coherencia
//Lo mismo hice con EventsBand por BandEvent 
