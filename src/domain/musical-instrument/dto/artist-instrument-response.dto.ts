import { Expose, Type } from "class-transformer";
import { MusicalInstrumentResponseDto } from "src/common/dto/musical-instrument-response.dto";
import { UserMinimalResponseDto } from "src/common/dto/user-minimal-response.dto";

export class ArtistInstrumentResponseDto {
    @Expose()
    id: string;

    @Expose()
    @Type(() => MusicalInstrumentResponseDto)
    instrument: MusicalInstrumentResponseDto;

    @Expose()
    @Type(() => UserMinimalResponseDto)
    user: UserMinimalResponseDto;

    @Expose()
    level: string;
}