import { Expose, Type } from "class-transformer";
import { RoleResponseDto } from "src/common/dto/role-response.dto";
import { UserResponseDto } from "./user-response.dto";

export class UserAdminResponseDto extends UserResponseDto {
    @Expose()
    @Type(() => RoleResponseDto)
    declare roles: RoleResponseDto[]; // Sin filtro, muestra todos los roles incluyendo Admin y SuperAdmin
}

