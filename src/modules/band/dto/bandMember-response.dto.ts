import { Expose, Transform, Type } from 'class-transformer';
import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';
import { BandResponseDto } from './band-response.dto';

export class BandMemberResponseDto {

    @Expose()
    id: string;

    @Expose()
    @Type(() => BandResponseDto)
    band: BandResponseDto;

    @Expose()
    @Type(() => UserResponseDto)
    user: UserResponseDto;

    @Expose()
    entryDate: Date;

    @Expose()
    @Transform(({ value }) =>
        Array.isArray(value)
            ? value.filter(date => date !== null)
            : []
    )
    departureDate: Date | null;

}