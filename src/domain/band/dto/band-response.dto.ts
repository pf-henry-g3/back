import { Exclude, Expose, Type } from 'class-transformer';
import { GenreResponseDto } from 'src/common/dto/genre-response.dto';
import { BandMemberResponseDto } from './bandMember-response.dto';
import { UserMinimalResponseDto } from 'src/common/dto/user-minimal-response.dto';

export class BandResponseDto {
    @Expose()
    id: string;

    @Expose()
    bandName: string;

    @Expose()
    @Type(() => UserMinimalResponseDto)
    leader: UserMinimalResponseDto;

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

    @Expose()
    @Type(() => GenreResponseDto)
    genres: GenreResponseDto[];

    @Expose()
    @Type(() => BandMemberResponseDto)
    bandMembers: BandMemberResponseDto[]
}