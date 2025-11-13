import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { GenreResponseDto } from 'src/common/dto/genre-response.dto';
import { RoleResponseDto } from 'src/common/dto/role-response.dto';

export class UserResponseDto {
    @Expose()
    id: string;

    @Expose()
    userName: string;

    @Expose()
    email: string;

    @Expose()
    name: string;

    @Expose()
    aboutMe: string;

    @Expose()
    urlImage: string;

    @Expose()
    city: string;

    @Expose()
    country: string;

    @Expose()
    averageRating: number;

    @Expose()
    isVerified: boolean;


    @Exclude()
    password: string;

    @Exclude()
    address: string;

    @Exclude()
    authProviderId: string;

    @Exclude()
    latitude: number;

    @Exclude()
    longitude: number;

    @Exclude()
    deleteAt: Date;

    @Expose()
    @Type(() => GenreResponseDto)
    genres: GenreResponseDto[];

    @Expose()
    @Type(() => RoleResponseDto)
    roles: RoleResponseDto[];
}
