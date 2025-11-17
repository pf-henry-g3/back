import { Expose } from "class-transformer";
import { BandMemberResponseDto } from "src/domain/band/dto/bandMember-response.dto";

export class BandMemberAdminResponseDto extends BandMemberResponseDto {
    @Expose()
    deleteAt: Date | null;
}