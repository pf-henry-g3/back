import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString } from "class-validator";

export const AllowedLevels = ['Beginner', 'Intermediate', 'Expert'];

export class InstrumentRegisterDto {
    @ApiProperty({ example: 'Guitarra', description: 'Nombre del instrumento.' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: 'Intermediate',
        description: 'Nivel de habilidad del usuario con el instrumento.',
        enum: AllowedLevels,
    })
    @IsString()
    @IsNotEmpty()
    @IsIn(AllowedLevels, { message: `El nivel debe ser uno de: ${AllowedLevels.join(', ')}` })
    level: string;
}