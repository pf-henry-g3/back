import { Genres } from "src/modules/genre/entities/genre.entity";
import { Roles } from "src/modules/role/entities/role.entity";
import { Vacancy } from "src/modules/vacancy/entities/vacancy.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'users'})
export class Users {
    @PrimaryGeneratedColumn('uuid')
    id: String;
    
    @Column()
    email: String;

    @Column()
    password: String;

    @Column()
    userName: String;
    
    @Column()
    birthDate: Date;
    
    @Column()
    name: String;

    @Column()
    aboutMe: String;

    @Column()
    averageRating: number;

    @Column()
    city: String;

    @Column()
    country: String;

    @Column()
    address: String;

    @Column()
    latitude: number;

    @Column()
    longitude: number;

    @Column()
    profilePicture: String;

    @ManyToMany(() => Roles, (role) => role.users)
    @JoinTable({name: 'user_roles'})
    roles: Roles[]

    @ManyToMany(() => Genres, (genre) => genre.users)
    @JoinTable({name: 'user_genres'})
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
