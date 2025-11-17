import { Expose } from "class-transformer";
import { ReviewResponseDto } from "src/domain/review/dto/review-response.dto";

export class ReviewAdminResponseDto extends ReviewResponseDto {
    @Expose()
    deleteAt: Date | null;

    @Expose()
    isFlagged: boolean;

    @Expose()
    moderationReason: string;
}