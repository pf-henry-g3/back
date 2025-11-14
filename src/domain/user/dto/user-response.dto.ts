import { Expose, Transform, TransformFnParams, Type } from 'class-transformer';
import { BandMinimalResponseDto } from 'src/common/dto/band-minimal-response.dto';
import { GenreResponseDto } from 'src/common/dto/genre-response.dto';
import { RoleResponseDto } from 'src/common/dto/role-response.dto';
import { Role } from 'src/common/enums/roles.enum';
import { BandMemberResponseDto } from 'src/domain/band/dto/bandMember-response.dto';
import { ArtistInstrumentResponseDto } from 'src/domain/musical-instrument/dto/artist-instrument-response.dto';
import { VacancyResponseDto } from 'src/domain/vacancy/dto/vacancy-response.dto';

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
    @Type(() => BandMinimalResponseDto)
    leaderOf: BandMinimalResponseDto;

    @Expose()
    @Type(() => BandMemberResponseDto)
    memberships: BandMemberResponseDto[];

    @Expose()
    @Type(() => VacancyResponseDto)
    vacancies: VacancyResponseDto[];

    @Expose()
    @Type(() => RoleResponseDto)
    roles: RoleResponseDto[];

    @Expose()
    @Type(() => ArtistInstrumentResponseDto)
    musicalInstruments: ArtistInstrumentResponseDto[];
}
