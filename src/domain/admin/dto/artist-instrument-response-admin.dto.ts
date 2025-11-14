import { Expose } from "class-transformer";
import { ArtistInstrumentResponseDto } from "src/domain/musical-instrument/dto/artist-instrument-response.dto";

export class ArtistInstrumentAdminResponseDto extends ArtistInstrumentResponseDto {
    @Expose()
    deleteAt: Date | null;
}