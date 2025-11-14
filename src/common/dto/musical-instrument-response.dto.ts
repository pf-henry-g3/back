import { Expose } from "class-transformer";

export class MusicalInstrumentResponseDto {
    @Expose()
    id: string;

    @Expose()
    name: string;
}