import { Band } from "src/modules/band/entities/band.entity";
import { BandMember } from "src/modules/band/entities/bandMember.entity";
import { Genre } from "src/modules/genre/entities/genre.entity";
import { Role } from "src/modules/role/entities/role.entity";
import { Vacancy } from "src/modules/vacancy/entities/vacancy.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  userName: string;

  @Column({
    type: 'date',
    nullable: false,
  })
  birthDate: Date;

  @Column({
    type: 'varchar',
    length: 100,
  })
  name: string;

  @Column({
    type: "text",
  })
  aboutMe: string;

  @Column({
    type: 'decimal',
    precision: 2,
    scale: 1,
    default: 0.0,
  })
  averageRating: number;

  @Column({
    type: 'varchar',
    length: 50
  })
  city: string;

  @Column({
    type: 'varchar',
    length: 50
  })
  country: string;

  @Column({
    type: 'text'
  })
  address: string;

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

  @Column({
    type: 'text',
    default: 'No Image',
  })
  urlImage: string;

  //Relacion con Role (roles del usuario)
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({ name: 'userRoles' })
  roles: Role[]

  //Relacion con Genero (Artista)
  @ManyToMany(() => Genre, (genre) => genre.users)
  @JoinTable({ name: 'userGenres' })
  genres: Genre[]

  //Relacion con vacante (creo vacantes)
  @OneToMany(() => Vacancy, (vacancy) => vacancy.ownerId, {
    eager: false,
  })
  vacancies: Vacancy[];

  // Relación con Banda (lidera bandas)
  @OneToMany(() => Band, (band) => band.leader)
  leaderOf: Band[];


  //Relacion con BandMembers
  @OneToMany(() => BandMember, (member) => member.user)
  meberships: BandMember[]

  //Relacion con SocialLinks
  //Relacion con ArtistMusicalInstruments
  //Relacion con Payment
  //Relacion con Review
  //Relacion con Media
}
