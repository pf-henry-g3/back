import { IsDate, IsOptional, IsString } from "class-validator";


export class CreateBandDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsString()
    formationDate: string;

    @IsString()
    @IsOptional()
    image?: string;

    @IsString({ each: true })
    genreIds: string[];

    //El leader de la banda es el usuario que cree la banda. Que debería ser el usuario regsitrado y logueado.
    //De donde sacamos esa info para crear el lider?
    //Por ahora voy a poner que el leader sea un usuario random dentro de users
    // @IsString()
    // leaderId: string;
}