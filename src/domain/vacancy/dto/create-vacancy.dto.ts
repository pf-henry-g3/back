import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";
export class CreateVacancyDto {
    @ApiProperty({
        example: "Busqueda Guitarrista",
        description: 'Titulo de la vacante',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name: string;

    @ApiProperty({
        example: "Se busca guitarrista con experiencia en pop +5 años",
        description: 'Descripcion de la vacante',
    })
    @IsString()
    @IsNotEmpty()
    vacancyDescription: string

    @ApiProperty({
        example: "https://res.cloudinary.com/dgxzi3eu0/image/upload/v1761796743/NoImage_p0ke5q.avif",
        description: 'Imagen de la vacante',
    })
    @IsString()
    urlImage?: string

    @ApiProperty({
        example: "Evento",
        description: 'Para que es la vacante',
    })
    @IsString()
    @MaxLength(50)
    vacancyType?: string

    @ApiProperty({
        example: ['Rock', 'Reggae', 'Jazz'],
        description: 'Generos de interes en la vacante'
    })
    @IsString({ each: true })
    @IsNotEmpty()
    genres: string[];
}
