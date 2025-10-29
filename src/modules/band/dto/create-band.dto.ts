import { IsDate, IsString } from "class-validator";


export class CreateBandDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsDate()
    formationDate: Date;

    @IsString()
    image?: string;
    
    @IsString({ each: true })
    genreIds: string[];

    @IsString()
    leaderId: string;
}