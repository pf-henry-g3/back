import { Expose } from "class-transformer";

export class VacancyMinimalResponseDto {
    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    vacancyDescription: string

    @Expose()
    urlImage: string;

    @Expose()
    isOpen: boolean
}