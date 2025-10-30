import { IsDate, IsString } from "class-validator";


export class CreateBandDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsDate()
    formationDate: Date;

    @IsString()
    urlImage?: string;

    @IsString({ each: true })
    genres: string[];

    @IsString()
    leaderId?: string;
}