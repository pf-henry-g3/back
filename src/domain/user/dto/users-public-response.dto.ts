import { Expose, Transform, Type } from "class-transformer";
import { RoleResponseDto } from "src/common/dto/role-response.dto";
import { Role } from "src/common/enums/roles.enum";
import { UserResponseDto } from "./user-response.dto";

export class UserPublicResponseDto extends UserResponseDto {
    @Expose()
    @Type(() => RoleResponseDto)
    @Transform(({ value }) => {
        if (!Array.isArray(value)) return value;
        return value.filter(
            (role) =>
                role.name !== Role.Admin &&
                role.name !== Role.SuperAdmin
        );
    })
    declare roles: RoleResponseDto[];
}