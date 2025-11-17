import { Expose } from "class-transformer";
import { RoleResponseDto } from "src/common/dto/role-response.dto";

export class RoleAdminResponseDto extends RoleResponseDto {
    @Expose()
    deleteAt: Date | null;
}