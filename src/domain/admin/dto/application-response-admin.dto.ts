import { Expose } from "class-transformer";
import { ApplicationResponseDto } from "src/domain/application/dto/application-response.dto";

export class ApplicationAdminResponseDto extends ApplicationResponseDto {
    @Expose()
    deleteAt: Date | null;
}