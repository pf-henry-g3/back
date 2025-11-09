import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString } from "class-validator";

// Definimos la estructura común de retorno
export class GlobalSearchResult {
    @ApiProperty()
    @IsString()
    id: string;

    @ApiProperty()
    @IsString()
    name: string; // userName o bandName o vacancyName

    @ApiProperty()
    @IsString()
    type: 'user' | 'band' | 'vacancy';

    @ApiProperty()
    @IsString()
    urlImage: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string; // aboutMe o bandDescription o vacancyDescription

    // Campos específicos de User
    @ApiProperty({ required: false })
    @IsOptional()
    birthDate?: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    averageRating?: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    city?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    country?: string;

    // Campos específicos de Band
    @ApiProperty({ required: false })
    @IsOptional()
    formationDate?: Date;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    leaderId?: string;

    // Campos específicos de Vacancy
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    ownerId?: string;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    isOpen?: boolean;
}

// Estructura de metadatos de paginación
export class SearchMeta {
    @ApiProperty()
    total: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;
}

// Estructura final de respuesta con paginación
export class PaginatedGlobalSearchResult {
    @ApiProperty({ type: SearchMeta })
    meta: SearchMeta;

    @ApiProperty({ type: [GlobalSearchResult] })
    data: GlobalSearchResult[];
}
