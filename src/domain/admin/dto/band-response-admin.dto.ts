import { Expose } from "class-transformer";
import { BandResponseDto } from "src/domain/band/dto/band-response.dto";

export class BandAdminResponseDto extends BandResponseDto {
    @Expose()
    deleteAt: Date | null;

    @Expose()
    isFlagged: boolean;

    @Expose()
    moderationReason: string;
}