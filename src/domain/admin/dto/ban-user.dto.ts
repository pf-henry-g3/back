import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class BanUserDto {
    @ApiProperty({
        description: 'Razon del baneo',
        example: "Comportamiento inapropiado"
    })
    @IsString()
    reason: string
}