import { Expose } from 'class-transformer';

export class GenreResponseDto {
    @Expose()
    id: string;

    @Expose()
    name: string;
}