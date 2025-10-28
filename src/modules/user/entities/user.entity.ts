import { Genres } from "src/modules/genre/entities/genre.entity";
import { Roles } from "src/modules/role/entities/role.entity";
import { Vacancy } from "src/modules/vacancy/entities/vacancy.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'users' })
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: String;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    unique: true,
  })
  email: String;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  password: String;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  userName: String;

  @Column({
    type: 'date',
    nullable: false,
  })
  birthDate: Date;

  @Column({
    type: 'varchar',
    length: 100,
  })
  name: String;

  @Column({
    type: "text",
  })
  aboutMe: String;

  @Column({
    type: 'number',
    precision: 1,
    default: 0
  })
  averageRating: number;

  @Column({
    type: 'varchar',
    length: 50
  })
  city: String;

  @Column({
    type: 'varchar',
    length: 50
  })
  country: String;

  @Column({
    type: 'text'
  })
  address: String;

  @Column({
    type: 'number',
    default: null,
  })
  latitude: number;

  @Column({
    type: 'number',
    default: null,
  })
  longitude: number;

  @Column({
    type: 'text',
    default: 'No Image',
  })
  profilePicture: String;

  @ManyToMany(() => Roles, (role) => role.users)
  @JoinTable({ name: 'user_roles' })
  roles: Roles[]

  @ManyToMany(() => Genres, (genre) => genre.users)
  @JoinTable({ name: 'user_genres' })
  genres: Genres[]

  @OneToMany(() => Vacancy, (v) => v.owerId, {
    eager: false,
  })
  vacancies: Vacancy[];
  //Relacion con SocialLinks
  //Relacion con ArtistMusicalInstruments
  //Relacion con BandMembers
  //Relacion con Payment
  //Relacion con Review
  //Relacion con Media
}
