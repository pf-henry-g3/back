import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsOptional, IsString } from "class-validator";


export class CreateBandDto {
    @ApiProperty({
        example: "Nombre de ejemplo"
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: "Banda de musica tropical con 30 años de trayectoria"
    })
    @IsString()
    description: string;

    @ApiProperty({
        example: "2005-01-01"
    })
    @IsString()
    formationDate: string;

    @IsString()
    @IsOptional()
    image?: string;


    @ApiProperty({
        example: ["", ""]
    })
    @IsString({ each: true })
    genreIds: string[];

    //El leader de la banda es el usuario que cree la banda. Que debería ser el usuario regsitrado y logueado.
    //De donde sacamos esa info para crear el lider?
    //Por ahora voy a poner que el leader sea un usuario random dentro de users
    // @IsString()
    // leaderId: string;
}