import { GenreResponseDto } from "src/common/dto/genre-response.dto";
import { MusicalInstrumentResponseDto } from "src/common/dto/musical-instrument-response.dto";
import { RoleResponseDto } from "src/common/dto/role-response.dto";
import { EntityName } from "src/common/enums/entity-names.enum";
import { BandResponseDto } from "src/domain/band/dto/band-response.dto";
import { BandMemberResponseDto } from "src/domain/band/dto/bandMember-response.dto";
import { Band } from "src/domain/band/entities/band.entity";
import { BandMember } from "src/domain/band/entities/bandMember.entity";
import { Genre } from "src/domain/genre/entities/genre.entity";
import { ArtistInstrumentResponseDto } from "src/domain/musical-instrument/dto/artist-instrument-response.dto";
import { AritstMusicalInstrument } from "src/domain/musical-instrument/entities/artist-musical-instrument.entity";
import { MusicalInstrument } from "src/domain/musical-instrument/entities/musical-instrument.entity";
import { ReviewResponseDto } from "src/domain/review/dto/review-response.dto";
import { Review } from "src/domain/review/entities/review.entity";
import { Role } from "src/domain/role/entities/role.entity";
import { UserResponseDto } from "src/domain/user/dto/user-response.dto";
import { User } from "src/domain/user/entities/user.entity";
import { VacancyResponseDto } from "src/domain/vacancy/dto/vacancy-response.dto";
import { Vacancy } from "src/domain/vacancy/entities/vacancy.entity";

export const ADMIN_ENTITY_MAP = {
    [EntityName.USER]: {
        entity: User,
        responseDto: UserResponseDto
    },
    [EntityName.BAND]: {
        entity: Band,
        responseDto: BandResponseDto
    },
    [EntityName.BANDMEMBER]: {
        entity: BandMember,
        responseDto: BandMemberResponseDto
    },
    [EntityName.VACANCY]: {
        entity: Vacancy,
        responseDto: VacancyResponseDto
    },
    [EntityName.INSTRUMENT]: {
        entity: MusicalInstrument,
        responseDto: MusicalInstrumentResponseDto
    },
    [EntityName.ARTISTINSTRUMENT]: {
        entity: AritstMusicalInstrument,
        responseDto: ArtistInstrumentResponseDto
    },
    [EntityName.REVIEW]: {
        entity: Review,
        responseDto: ReviewResponseDto
    },
    [EntityName.ROL]: {
        entity: Role,
        responseDto: RoleResponseDto
    },
    [EntityName.GENRE]: {
        entity: Genre,
        responseDto: GenreResponseDto
    },
}