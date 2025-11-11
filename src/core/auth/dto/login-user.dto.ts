import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

// Nota: en login no imponemos reglas de "strong password".
// Solo validamos formato básico para no rechazar contraseñas válidas ya registradas.
export class LoginUserDto {
    @ApiProperty({
        example: 'rock.singer@mail.com',
        description: "Email del usuario para iniciar sesión"
    })
    @IsNotEmpty({ message: "El email es obligatorio" })
    @IsEmail({}, { message: "Formato inválido" })
    email: string;

    @ApiProperty({
        example: 'CualquierContraseñaRegistrada',
        description: "Contraseña para iniciar sesión"
    })
    @IsNotEmpty({ message: "La contraseña es obligatoria" })
    @IsString({ message: "La contraseña debe ser un string" })
    password: string;
}