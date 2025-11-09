import { Expose } from "class-transformer";

export class BandMinimalResponseDto {
    @Expose()
    id: string;

    @Expose()
    bandName: string;

    @Expose()
    urlImage: string;

    @Expose()
    averageRating: number;
}