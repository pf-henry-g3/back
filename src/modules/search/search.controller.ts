import { Controller, Get, Param, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';


@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) { }

  @Get('global')
  //Ejemplo para la documentacion de swagger
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Texto a buscar en la DB'
  })
  @ApiQuery({
    name: 'types',
    required: false,
    description: 'Filtro opcional por tipo de entidad, no es un array',
    example: 'user,vacancy'
  })
  @ApiQuery({
    name: 'genres',
    required: false,
    description: 'Filtro opcional por genero, no es un array',
    example: 'rock,jazz'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Paginado opcional',
    example: '1'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Paginado opcional',
    example: '10'
  })
  @ApiQuery({
    name: 'genres',
    required: false,
    description: 'Filtro opcional por genero, no es un array',
    example: 'rock,jazz'
  })
  @ApiResponse({
    status: 200, description: 'Resultado de busqueda global filtrado.'
  })
  //Metodo del endpoint
  globalSearch(
    @Query('q') query: string,
    @Query('types') types?: string, //filtro por tipo de entidad
    @Query('genres') genres?: string, //filtro por generos
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!query || query.length < 2) { //limite para evitar busquedas muy cortas
      return [];
    }

    const pageNum = page ? +page : undefined;
    const limitNum = limit ? +limit : undefined;

    return this.searchService.globalSearch(query, types, genres, pageNum, limitNum);
  }
}
