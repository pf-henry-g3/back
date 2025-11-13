import { Expose, Transform, Type } from 'class-transformer';
import { UserMinimalResponseDto } from 'src/common/dto/user-minimal-response.dto';
import { BandMinimalResponseDto } from 'src/common/dto/band-minimal-response.dto';

export class BandMemberResponseDto {

    @Expose()
    id: string;

    @Expose()
    @Type(() => BandMinimalResponseDto)
    band: BandMinimalResponseDto;

    @Expose()
    @Type(() => UserMinimalResponseDto)
    user: UserMinimalResponseDto;

    @Expose()
    entryDate: Date;

    @Expose()
    @Type(() => Date)
    departureDate: Date | null;
}