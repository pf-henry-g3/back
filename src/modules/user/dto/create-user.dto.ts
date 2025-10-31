import { IsDateString, IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty({ message: 'El email es obligatorio' })
    @IsEmail({}, { message: 'Formato invalido' })
    email: string;

    @IsNotEmpty({ message: 'La contraseña es obligatorio' })
    @IsString({ message: 'La constraseña debe ser un string' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @MaxLength(15, { message: 'La contraseña no debe tener mas de 15 caracteres' })
    @IsStrongPassword({
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    },
        { message: 'La contraseña debe tener al menos una mayuscula, una minuscula, un numero y un caracter especial' })
    password: string;

    @IsNotEmpty({ message: 'Confirmar contraseña' })
    @IsString({ message: 'La constraseña debe ser un string' })
    confirmPassword: string;

    @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
    @IsString({ message: 'El nombre de usuario debe ser un string' })
    @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
    @MaxLength(80, { message: 'El nombre de usuario no puede tener mas de 80 caracteres' })
    userName: string;

    @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
    @IsDateString({}, { message: 'Debe ser una cadena de fecha válida (ISO 8601).' })
    birthDate: Date;

    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @IsString({ message: 'El nombre debe ser un string' })
    @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    @MaxLength(80, { message: 'El nombre no puede tener mas de 80 caracteres' })
    name: string;

    //validaciones innecesarias por ahora
    aboutMe?: string;
    averageRating?: number;
    city?: string;
    country?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    profilePicture?: string;
}
