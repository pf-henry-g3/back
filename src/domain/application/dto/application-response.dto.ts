import { Expose, Type } from "class-transformer";
import { UserMinimalResponseDto } from "src/common/dto/user-minimal-response.dto";
import { VacancyMinimalResponseDto } from "src/common/dto/vacancy-minimal-response.dto";

export class ApplicationResponseDto {
    @Expose()
    id: string;

    @Expose()
    @Type(() => VacancyMinimalResponseDto)
    vacancyId: VacancyMinimalResponseDto;

    @Expose()
    @Type(() => UserMinimalResponseDto)
    applicantId: UserMinimalResponseDto;

    @Expose()
    applicationDate: Date;

    @Expose()
    applicationDescription: string;

    @Expose()
    status: string;
}