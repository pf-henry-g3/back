import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateApplicationDto {
    @ApiProperty({
        example: 'uuid-de-la-vacante',
        description: 'ID de la vacante a la que el usuario se postula',
    })
    @IsUUID()
    @IsNotEmpty()
    vacancyId: string;

    @ApiPropertyOptional({
        example: 'Estoy interesado en participar del evento.',
        description: 'Descripción opcional de la postulación',
    })
    @IsOptional()
    @IsString()
    applicationDescription?: string;
}
