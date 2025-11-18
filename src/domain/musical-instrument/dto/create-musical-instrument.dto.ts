import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateMusicalInstrumentDto {
    @ApiProperty({
        example: "Guitarra",
        description: 'Nombre del instrumento musical, es unico'
    })
    @IsString()
    name: string;
}
