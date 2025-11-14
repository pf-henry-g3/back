import { Expose } from "class-transformer";
import { GenreResponseDto } from "src/common/dto/genre-response.dto";

export class GenreAdminResponseDto extends GenreResponseDto {
    @Expose()
    deleteAt: Date | null;
}