import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateBandDto } from "./create-band.dto";
import { IsArray, IsOptional, IsString } from "class-validator";

export class UpdateBandDto extends PartialType(CreateBandDto) {
    @ApiProperty({
        description: 'Lista de nombres de géneros a añadir a la banda. Ej: ["Rock", "Jazz"]',
        isArray: true,
        type: [String],
        example: ["Rock", "Jazz", "Electronic"],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    newGenres?: string[];
}