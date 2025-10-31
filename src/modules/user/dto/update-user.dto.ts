import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({
        description: 'Lista de nombres de géneros a añadir al usuario. Ej: ["Rock", "Jazz"]',
        isArray: true,
        type: [String],
        example: ["Rock", "Jazz", "Electronic"],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    newGenres?: string[];

    @ApiProperty({
        description: 'Lista de nombres de roles a añadir al usuario. Ej: ["Admin", "Musico"]',
        isArray: true,
        type: [String],
        example: ["Artist", "BandLeader"]
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    newRoles?: string[];
}
