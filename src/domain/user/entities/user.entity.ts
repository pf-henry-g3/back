import { Band } from "src/domain/band/entities/band.entity";
import { BandMember } from "src/domain/band/entities/bandMember.entity";
import { Genre } from "src/domain/genre/entities/genre.entity";
import { AritstMusicalInstrument } from "src/domain/musical-instrument/entities/artist-musical-instrument.entity";
import { Review } from "src/domain/review/entities/review.entity";
import { Role } from "src/domain/role/entities/role.entity";
import { Vacancy } from "src/domain/vacancy/entities/vacancy.entity";
import { Column, DeleteDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  name: string;

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
    nullable: true,
  })
  password: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    unique: true,
  })
  userName: string;

  @Column({
    type: 'varchar',
    nullable: true,
    default: null
  })
  authProviderId: string | null;

  @Column({
    type: 'date',
    nullable: true,
  })
  birthDate: Date | null;

  @Column({
    type: "text",
    nullable: true
  })
  aboutMe: string;

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
    type: 'text',
    nullable: true
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
    default: 'https://res.cloudinary.com/dgxzi3eu0/image/upload/v1761796743/NoPorfilePicture_cwzyg6.jpg',
  })
  urlImage: string;

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

  @Column({
    default: false,
    nullable: true,
  })
  isBanned: boolean;

  @Column({
    type: 'text',
    nullable: true,
  })
  reasonForBan: string;

  //Borrado logico
  @DeleteDateColumn({
    nullable: true,
  })
  deleteAt: Date | null;

  //Verificacion del usuario
  @Column({ default: false })
  isVerified: boolean;

  //Relacion con Role (roles del usuario)
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({ name: 'userRoles' })
  roles: Role[]

  //Relacion con Genero (Artista)
  @ManyToMany(() => Genre, (genre) => genre.users)
  @JoinTable({ name: 'userGenres' })
  genres: Genre[]

  //Relacion con vacante (creo vacantes)
  @OneToMany(() => Vacancy, (vacancy) => vacancy.owner, {
    eager: false,
  })
  vacancies: Vacancy[];

  // Relación con Banda (lidera bandas)
  @OneToMany(() => Band, (band) => band.leader)
  leaderOf: Band[];

  //Relacion con BandMembers
  @OneToMany(() => BandMember, (member) => member.user)
  memberships: BandMember[]

  // Relación con Review (dadas)
  @OneToMany(() => Review, (review) => review.owner)
  reviewsGiven: Review[];

  // Relación con Review (recibidas)
  @OneToMany(() => Review, (review) => review.receptor)
  reviewsReceived: Review[];

  // Relacion con instrumentos
  @OneToMany(() => AritstMusicalInstrument, (instrument) => instrument.user)
  musicalInstruments: AritstMusicalInstrument[];

  //Relacion con SocialLinks
  //Relacion con Media
}
