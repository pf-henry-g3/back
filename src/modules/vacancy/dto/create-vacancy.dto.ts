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
        example: "https://res.cloudinary.com/dgxzi3eu0/image/upload/v1761796743/NoImage_p0ke5q.avif"
    })
    @IsString()
    urlImage?: string

    @ApiProperty({
        example: "Evento"
    })
    @IsString()
    @MaxLength(50)
    owerType?: string

    @ApiProperty({
        example: "UUID"
    })
    @IsString()
    owerId?: string;

    @ApiProperty({
        example: ['Rock, Reggae, Jazz']
    })
    @IsString({ each: true })
    @IsNotEmpty()
    genres: string[];
}
