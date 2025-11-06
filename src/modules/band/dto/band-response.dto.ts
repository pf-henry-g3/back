import { Exclude, Expose, Type } from 'class-transformer';
import { GenreResponseDto } from 'src/common/dto/genre-response.dto';
import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';
import { BandMemberResponseDto } from './bandMember-response.dto';

export class BandResponseDto {
    @Expose()
    id: string;

    @Expose()
    bandName: string;

    @Expose()
    @Type(() => UserResponseDto)
    leader: UserResponseDto;

    @Expose()
    bandDescription: string;

    @Expose()
    formationDate: Date;

    @Expose()
    urlImage: string;

    @Expose()
    averageRating: number;

    @Expose()
    city: string;

    @Expose()
    country: string;

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
    @Type(() => BandMemberResponseDto)
    bandMembers: BandMemberResponseDto[]
}