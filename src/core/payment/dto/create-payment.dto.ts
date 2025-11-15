import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";
export class CreatePaymentDto {

    @ApiProperty({
        example: "500",
    })
    @IsNumber()
    amount: number
}
