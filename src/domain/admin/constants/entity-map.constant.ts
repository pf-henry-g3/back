import { EntityName } from "src/common/enums/entity-names.enum";
import { Band } from "src/domain/band/entities/band.entity";
import { BandMember } from "src/domain/band/entities/bandMember.entity";
import { Genre } from "src/domain/genre/entities/genre.entity";
import { AritstMusicalInstrument } from "src/domain/musical-instrument/entities/artist-musical-instrument.entity";
import { MusicalInstrument } from "src/domain/musical-instrument/entities/musical-instrument.entity";
import { Review } from "src/domain/review/entities/review.entity";
import { Role } from "src/domain/role/entities/role.entity";
import { User } from "src/domain/user/entities/user.entity";
import { Vacancy } from "src/domain/vacancy/entities/vacancy.entity";
import { UserAdminResponseDto } from "../dto/user-response-admin.dto";
import { BandAdminResponseDto } from "../dto/band-response-admin.dto";
import { BandMemberAdminResponseDto } from "../dto/band-member-response-admin.dto";
import { VacancyAdminResponseDto } from "../dto/vacancy-response-admin.dto";
import { MusicalInstrumentAdminResponseDto } from "../dto/musical-instrument-response-admin.dto";
import { RoleAdminResponseDto } from "../dto/role-response-admin.dto";
import { GenreAdminResponseDto } from "../dto/genre-response-admin.dto";
import { ReviewAdminResponseDto } from "../dto/review-response-admin.dto";
import { ArtistInstrumentAdminResponseDto } from "../dto/artist-instrument-response-admin.dto";

export const ADMIN_ENTITY_MAP = {
    [EntityName.USER]: {
        entity: User,
        responseDto: UserAdminResponseDto,
        defaultRelations: ['roles', 'genres', 'vacancies', 'leaderOf', 'musicalInstruments', 'memberships'],
        historyRelations: {
            vacancies: { entity: Vacancy, relationField: 'owner' },
            memberships: { entity: BandMember, relationField: 'user' },
        },
    },
    [EntityName.BAND]: {
        entity: Band,
        responseDto: BandAdminResponseDto,
        defaultRelations: ['leader', 'genres', 'bandMembers'],
        historyRelations: {

        },
    },
    [EntityName.BANDMEMBER]: {
        entity: BandMember,
        responseDto: BandMemberAdminResponseDto,
        defaultRelations: ['user', 'band'],
        historyRelations: {

        },
    },
    [EntityName.VACANCY]: {
        entity: Vacancy,
        responseDto: VacancyAdminResponseDto,
        defaultRelations: ['genres', 'owner'],
        historyRelations: {

        },
    },
    [EntityName.INSTRUMENT]: {
        entity: MusicalInstrument,
        responseDto: MusicalInstrumentAdminResponseDto,
        defaultRelations: [],
        historyRelations: {

        },
    },
    [EntityName.ARTISTINSTRUMENT]: {
        entity: AritstMusicalInstrument,
        responseDto: ArtistInstrumentAdminResponseDto,
        defaultRelations: ['instrument', 'user'],
        historyRelations: {

        },
    },
    [EntityName.REVIEW]: {
        entity: Review,
        responseDto: ReviewAdminResponseDto,
        defaultRelations: ['owner', 'receptor'],
        historyRelations: {

        },
    },
    [EntityName.ROL]: {
        entity: Role,
        responseDto: RoleAdminResponseDto,
        defaultRelations: [],
        historyRelations: {

        },
    },
    [EntityName.GENRE]: {
        entity: Genre,
        responseDto: GenreAdminResponseDto,
        defaultRelations: [],
        historyRelations: {

        },
    },
}