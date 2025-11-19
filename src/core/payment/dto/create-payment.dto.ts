import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";
export class CreatePaymentDto {

    @ApiProperty({
        example: "500",
    })
    @IsNumber()
    amount: number
}
