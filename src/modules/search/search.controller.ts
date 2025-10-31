import { Controller, Get, Param, Query } from '@nestjs/common';
import { SearchService } from './search.service';


@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) { }

  @Get('global')
  globalSearch(@Query('q') query: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    if (!query || query.length < 2) { //limite para evitar busquedas muy cortas
      return [];
    }
    if (page && limit) {
      return this.searchService.globalSearch(query, +page, +limit);
    }

    return this.searchService.globalSearch(query);
  }
}
