import { Expose } from "class-transformer";
import { VacancyResponseDto } from "src/domain/vacancy/dto/vacancy-response.dto";

export class VacancyAdminResponseDto extends VacancyResponseDto {
    @Expose()
    deleteAt: Date | null;

    @Expose()
    isFlagged: boolean;

    @Expose()
    moderationReason: string;
}