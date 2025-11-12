import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateReviewDto {

    @ApiProperty({
        example: 'RockStar45',
        description: 'Usuario receptor de la review',
        required: true,
    })
    @IsNotEmpty({ message: 'El usuario receptor debe ser proporcionado' })
    @IsString({ message: "El nombre de usuario debe ser un string" })
    @MinLength(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" })
    @MaxLength(80, {
        message: "El nombre de usuario no puede tener más de 80 caracteres",
    })
    receptorUserName: string;

    @ApiProperty({
        example: 4.5,
        description: "Calificación otorogada en la review",
        required: true,
    })
    @IsNumber()
    score: number;

    @ApiProperty({
        example: "Gran musico, muy puntual cuando fue requerido, copado, trabaja muy bien",
        description: "Texto de la review",
        required: false,
    })
    @IsString({ message: 'La descripcion debe ser un string' })
    @IsOptional()
    reviewDescription?: string;

    @ApiProperty({
        example: "https://res.cloudinary.com/dgxzi3eu0/image/upload/v1761796743/NoPorfilePicture_cwzyg6.jpg",
        description: "URL de la foto",
        required: false,
    })
    @IsString({ message: 'La URL de la imagen ser un string' })
    @IsOptional()
    urlImage?: string;
}
