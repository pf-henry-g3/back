import { Expose, Type } from 'class-transformer';
import { GenreResponseDto } from 'src/common/dto/genre-response.dto';
import { RoleResponseDto } from 'src/common/dto/role-response.dto';
import { BandResponseDto } from 'src/domain/band/dto/band-response.dto';
import { BandMemberResponseDto } from 'src/domain/band/dto/bandMember-response.dto';
import { ArtistInstrumentResponseDto } from 'src/domain/musical-instrument/dto/artist-instrument-response.dto';

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

    @Expose()
    @Type(() => GenreResponseDto)
    genres: GenreResponseDto[];

    @Expose()
    @Type(() => BandResponseDto)
    leaderOf: BandResponseDto;

    @Expose()
    @Type(() => BandMemberResponseDto)
    memberShips: BandMemberResponseDto[];

    @Expose()
    @Type(() => RoleResponseDto)
    roles: RoleResponseDto[];

    @Expose()
    @Type(() => ArtistInstrumentResponseDto)
    instruments: ArtistInstrumentResponseDto[];
}
