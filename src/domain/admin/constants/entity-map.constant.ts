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
import { UserMinimalResponseDto } from "src/common/dto/user-minimal-response.dto";
import { BandMinimalResponseDto } from "src/common/dto/band-minimal-response.dto";
import { VacancyMinimalResponseDto } from "src/common/dto/vacancy-minimal-response.dto";

export const ADMIN_ENTITY_MAP = {
    [EntityName.USER]: {
        entity: User,
        responseDto: UserAdminResponseDto,
        defaultRelations: ['roles', 'genres', 'vacancies', 'leaderOf', 'musicalInstruments', 'memberships'],
        historyRelations: {
            vacancies: { entity: Vacancy, relationField: 'owner', responseDto: VacancyMinimalResponseDto },
            memberships: { entity: BandMember, relationField: 'user', responseDto: BandAdminResponseDto },
            reviewsGiven: { entity: Review, relationField: 'owner', responseDto: ReviewAdminResponseDto },
            reviewsReceived: { entity: Review, relationField: 'receptor', responseDto: ReviewAdminResponseDto },
            leaderOf: { entity: Band, relationField: 'leader', responseDto: BandMinimalResponseDto },
            musicalInstruments: { entity: AritstMusicalInstrument, relationField: 'user', responseDto: ArtistInstrumentAdminResponseDto },
            genres: { entity: Genre, relationField: 'users', isManyToMany: true, responseDto: GenreAdminResponseDto },
            roles: { entity: Role, relationField: 'users', isManyToMany: true, responseDto: RoleAdminResponseDto },
        },
    },
    [EntityName.BAND]: {
        entity: Band,
        responseDto: BandAdminResponseDto,
        defaultRelations: ['leader', 'genres', 'bandMembers'],
        historyRelations: {
            bandMembers: { entity: BandMember, relationField: 'band', responseDto: BandMemberAdminResponseDto },
            genres: { entity: Genre, relationField: 'bands', isManyToMany: true, responseDto: GenreAdminResponseDto },
        },
    },
    [EntityName.BANDMEMBER]: {
        entity: BandMember,
        responseDto: BandMemberAdminResponseDto,
        defaultRelations: ['user', 'band'],
        historyRelations: {},
    },
    [EntityName.VACANCY]: {
        entity: Vacancy,
        responseDto: VacancyAdminResponseDto,
        defaultRelations: ['genres', 'owner', 'instruments'],
        historyRelations: {
            genres: { entity: Genre, relationField: 'vacancies', isManyToMany: true, responseDto: VacancyMinimalResponseDto },
            instruments: { entity: MusicalInstrument, relationField: 'vacancies', isManyToMany: true, responseDto: VacancyMinimalResponseDto },
        },
    },
    [EntityName.INSTRUMENT]: {
        entity: MusicalInstrument,
        responseDto: MusicalInstrumentAdminResponseDto,
        defaultRelations: ['artistMusicalInstrument', 'vacancies'],
        historyRelations: {
            artistMusicalInstrument: { entity: AritstMusicalInstrument, relationField: 'user', responseDto: UserMinimalResponseDto },
            vacancies: { entity: Vacancy, relationField: 'vacancies', isManyToMany: true, responseDto: VacancyMinimalResponseDto },
        },
    },
    [EntityName.ARTISTINSTRUMENT]: {
        entity: AritstMusicalInstrument,
        responseDto: ArtistInstrumentAdminResponseDto,
        defaultRelations: ['instrument', 'user'],
        historyRelations: {},
    },
    [EntityName.REVIEW]: {
        entity: Review,
        responseDto: ReviewAdminResponseDto,
        defaultRelations: ['owner', 'receptor'],
        historyRelations: {},
    },
    [EntityName.ROL]: {
        entity: Role,
        responseDto: RoleAdminResponseDto,
        defaultRelations: ['users'],
        historyRelations: {
            users: { entity: User, relationField: 'roles', isManyToMany: true, responseDto: UserMinimalResponseDto },
        },
    },
    [EntityName.GENRE]: {
        entity: Genre,
        responseDto: GenreAdminResponseDto,
        defaultRelations: ['users', 'bands', 'vacancies'],
        historyRelations: {
            users: { entity: User, relationField: 'genres', isManyToMany: true, responseDto: UserMinimalResponseDto },
            bands: { entity: Band, relationField: 'genres', isManyToMany: true, responseDto: BandMinimalResponseDto },
            vacancies: { entity: Vacancy, relationField: 'genres', isManyToMany: true, responseDto: VacancyMinimalResponseDto },
        },
    },
}