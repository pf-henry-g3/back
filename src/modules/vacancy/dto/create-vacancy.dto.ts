import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";
export class CreateVacancyDto {
    @ApiProperty({
        example: "Busqueda Guitarrista"
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name: string;

    @ApiProperty({
        example: "Se busca guitarrista con experiencia en pop +5 años"
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    vacancyDescription: string


    @ApiProperty({
        example: "Evento"
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    owerType: string

    @ApiProperty({
        example: "UUID"
    })
    @IsString()
    @IsNotEmpty()
    owerId: string;
}
