import { Expose, Type } from "class-transformer"
import { GenreResponseDto } from "src/common/dto/genre-response.dto"
import { UserMinimalResponseDto } from "src/common/dto/user-minimal-response.dto"

export class VacancyResponseDto {

    @Expose()
    id: string

    @Expose()
    name: string

    @Expose()
    vacancyDescription: string

    @Expose()
    isOpen: boolean

    @Expose()
    urlImage: string

    @Expose()
    @Type(() => GenreResponseDto)
    genres: GenreResponseDto[];

    @Expose()
    @Type(() => UserMinimalResponseDto)
    owner: UserMinimalResponseDto;
}