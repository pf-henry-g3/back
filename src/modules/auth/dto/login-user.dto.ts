import { ApiProperty, PickType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";

export class LoginUserDto extends PickType(CreateUserDto, [
    'email',
    'password'
]) {
    @ApiProperty({
        example: 'rock.singer@mail.com',
        description: "Email del usuario para iniciar sesión"
    })
    email: string; // Se sobrescribe solo la metadata de Swagger

    @ApiProperty({
        example: 'securePass123!',
        description: "Contraseña para iniciar sesión"
    })
    password: string;
}