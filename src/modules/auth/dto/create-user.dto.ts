import { ApiProperty } from "@nestjs/swagger";
import {
    IsDateString,
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsStrongPassword,
    MaxLength,
    MinLength,
} from "class-validator";

export class CreateUserDto {
    @ApiProperty({
        example: "usuario@example.com",
        description: "Correo electrónico válido del usuario",
    })
    @IsNotEmpty({ message: "El email es obligatorio" })
    @IsEmail({}, { message: "Formato inválido" })
    email: string;

    @ApiProperty({
        example: "Contraseña1!",
        description:
            "Contraseña entre 8 y 15 caracteres con mayúscula, minúscula, número y símbolo",
    })
    @IsNotEmpty({ message: "La contraseña es obligatoria" })
    @IsString({ message: "La contraseña debe ser un string" })
    @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    @MaxLength(15, {
        message: "La contraseña no debe tener más de 15 caracteres",
    })
    @IsStrongPassword(
        {
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        },
        {
            message:
                "La contraseña debe tener al menos una mayúscula, una minúscula, un número y un carácter especial",
        },
    )
    password: string;

    @ApiProperty({
        example: "Contraseña1!",
        description: "Debe coincidir con el campo password",
    })
    @IsNotEmpty({ message: "Confirmar contraseña es obligatorio" })
    @IsString({ message: "La contraseña debe ser un string" })
    confirmPassword: string;

    @ApiProperty({
        example: "JuanPerez",
        description: "Nombre de usuario entre 3 y 80 caracteres",
    })
    @IsNotEmpty({ message: "El nombre de usuario es obligatorio" })
    @IsString({ message: "El nombre de usuario debe ser un string" })
    @MinLength(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" })
    @MaxLength(80, {
        message: "El nombre de usuario no puede tener más de 80 caracteres",
    })
    userName: string;

    @ApiProperty({
        example: "1995-08-15",
        description: "Fecha de nacimiento en formato ISO 8601 (YYYY-MM-DD)",
    })
    @IsNotEmpty({ message: "La fecha de nacimiento es obligatoria" })
    @IsDateString({}, { message: "Debe ser una cadena de fecha válida (ISO 8601)." })
    birthDate: Date;

    @ApiProperty({
        example: "Juan",
        description: "Nombre real del usuario"
    })
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @IsString({ message: 'El nombre debe ser un string' })
    @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    @MaxLength(80, { message: 'El nombre no puede tener mas de 80 caracteres' })
    name: string;

    @ApiProperty({
        example: "Vocalista apasionado por el rock alternativo. Buscando músicos para una banda de covers.",
        description: "Biografia del usuario",
        required: false,
    })
    @IsString({ message: 'La descripcion debe ser un string' })
    @IsOptional()
    aboutMe?: string;

    @ApiProperty({
        example: "Buenos Aires",
        description: "Ciudad de residencia",
        required: false,
    })
    @IsString({ message: 'La ciudad debe ser un string' })
    @IsOptional()
    city?: string;

    @ApiProperty({
        example: "Argentina",
        description: "País de residencia"
    })
    @IsString({ message: 'El pais debe ser un string' })
    @IsOptional()
    country?: string;

    @ApiProperty({
        example: 4.5,
        description: "Calificación promedio del usuario calculada desde las reviews",
        required: false,
    })
    @IsNumber()
    @IsOptional()
    averageRating?: number;

    @ApiProperty({
        example: "Av. Corrientes 1234",
        description: "Dirección física",
        required: false,
    })
    @IsString({ message: 'La direccion debe ser un string' })
    @IsOptional()
    address?: string;

    @ApiProperty({
        example: -34.6037,
        description: "Latitud geográfica",
        required: false,
    })
    @IsNumber()
    @IsOptional()
    latitude?: number;

    @ApiProperty({
        example: -58.3816,
        description: "Longitud geográfica",
        required: false,
    })
    @IsNumber()
    @IsOptional()
    longitude?: number;

    @ApiProperty({
        example: "https://res.cloudinary.com/dgxzi3eu0/image/upload/v1761796743/NoPorfilePicture_cwzyg6.jpg",
        description: "URL de la foto de perfil",
        required: false,
    })
    @IsString({ message: 'La URL de la imagen ser un string' })
    @IsOptional()
    profilePicture?: string;
}
