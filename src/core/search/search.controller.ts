import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) { }

  @Get('global')
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Texto a buscar en la base de datos',
  })
  @ApiQuery({
    name: 'types',
    required: false,
    description: 'Filtro opcional por tipo de entidad (separado por comas)',
    example: 'user,vacancy,band',
  })
  @ApiQuery({
    name: 'genres',
    required: false,
    description: 'Filtro opcional por género (separado por comas)',
    example: 'rock,jazz',
  })
  @ApiQuery({
    name: 'vacancyTypes',
    required: false,
    description: 'Filtro opcional por tipo de vacante/instrumento (separado por comas)',
    example: 'Guitarra,Piano',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Página actual para paginación',
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad de resultados por página',
    example: '10',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado de búsqueda global filtrado.',
  })
  globalSearch(
    @Query('q') query: string,
    @Query('types') typesRaw?: string,
    @Query('genres') genresRaw?: string,
    @Query('vacancyTypes') vacancyTypesRaw?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!query || query.length < 2) {
      return [];
    }

    const types = typesRaw ? typesRaw.split(',').map(t => t.trim()) : undefined;

    //funcion para normalizar los filtros recibidos
    const splitAndClean = (raw?: string) => raw ? raw.split(',').map(t => t.trim()) : undefined;

    const genres = splitAndClean(genresRaw);
    const vacancyTypes = splitAndClean(vacancyTypesRaw);

    const pageNum = page ? +page : undefined;
    const limitNum = limit ? +limit : undefined;

    // construir el objeto filters para todos los filtros
    const filters: Record<string, any> = {};

    // 1. Agregar géneros
    if (genres && genres.length > 0) {
      filters.genre = genres;
    }

    // 2. Agregar tipo de vacante
    if (vacancyTypes && vacancyTypes.length > 0) {
      filters.vacancyType = vacancyTypes;
    }

    return this.searchService.globalSearch(query, filters, types, pageNum, limitNum);
  }
}
