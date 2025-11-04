import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateBandDto {
    @ApiProperty({
        example: "Nombre de ejemplo",
        description: 'Nombre de la banda, es unico'
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: "Banda de musica tropical con 30 años de trayectoria",
        description: 'Biografia de la banda',
    })
    @IsString()
    description: string;

    @ApiProperty({
        example: "2005-01-01",
        description: 'Fecha de formacion de la banda'
    })
    @IsString()
    formationDate: string;

    @ApiProperty({
        example: "https://res.cloudinary.com/dgxzi3eu0/image/upload/v1761796743/NoImage_p0ke5q.avif",
        description: 'Imagen de la vacante',
    })
    @IsString()
    @IsOptional()
    image?: string;


    @ApiProperty({
        example: ['Rock', 'Reggae', 'Jazz'],
        description: 'Generos de interes en la vacante'
    })
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    genreIds: string[];

    @ApiProperty({
        example: "UUID",
        description: 'Id del usuario propietario de la vacante'
    })
    @IsString()
    leaderId: string;
}