import { Expose, Type } from "class-transformer";
import { UserMinimalResponseDto } from "src/common/dto/user-minimal-response.dto";

export class ReviewResponseDto {
    @Expose()
    id: string;

    @Expose()
    @Type(() => UserMinimalResponseDto)
    owner: UserMinimalResponseDto;

    @Expose()
    @Type(() => UserMinimalResponseDto)
    receptor: UserMinimalResponseDto;

    @Expose()
    date: Date;

    @Expose()
    score: number;

    @Expose()
    reviewDescription: string;

    @Expose()
    urlImage: string;
}