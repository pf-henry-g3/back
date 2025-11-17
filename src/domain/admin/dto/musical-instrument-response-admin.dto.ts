import { Expose } from "class-transformer";
import { MusicalInstrumentResponseDto } from "src/common/dto/musical-instrument-response.dto";

export class MusicalInstrumentAdminResponseDto extends MusicalInstrumentResponseDto {
    @Expose()
    deleteAt: Date | null;
}