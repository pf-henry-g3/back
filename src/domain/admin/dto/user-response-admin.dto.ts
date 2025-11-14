import { Expose, Type } from "class-transformer";
import { UserResponseDto } from "src/domain/user/dto/user-response.dto";

export class UserAdminResponseDto extends UserResponseDto {
    @Expose()
    deleteAt: Date | null;

    @Expose()
    authProviderId: string | null;

    @Expose()
    isFlagged: boolean;

    @Expose()
    moderationReason: string;
}