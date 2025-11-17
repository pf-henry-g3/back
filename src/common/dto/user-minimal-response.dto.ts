import { Expose, Type } from "class-transformer";
import { RoleResponseDto } from "./role-response.dto";

export class UserMinimalResponseDto {
    @Expose()
    id: string;

    @Expose()
    userName: string;

    @Expose()
    name: string;

    @Expose()
    urlImage: string;

    @Expose()
    averageRating: number;

    @Expose()
    @Type(() => RoleResponseDto)
    roles?: RoleResponseDto[];
}
