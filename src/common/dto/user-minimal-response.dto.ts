import { Expose } from "class-transformer";

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
}
