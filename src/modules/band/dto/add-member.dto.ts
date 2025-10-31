import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";


export class AddMemberDto {
    @ApiProperty({
        example: "RockStar45"
    })
    @IsNotEmpty({ message: 'Debe ingresar un nombre de usuario' })
    @IsString({ message: "El nombre de usuario debe ser un string" })
    @MinLength(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" })
    @MaxLength(80, {
        message: "El nombre de usuario no puede tener más de 80 caracteres",
    })
    userName: string
}

