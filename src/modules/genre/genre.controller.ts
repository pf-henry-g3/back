import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dto/create-genre.dto';

@Controller('genre')
export class GenreController {
  constructor(private readonly genreService: GenreService) { }

  @Post()
  create(@Body() createGenreDto: CreateGenreDto) {
    return this.genreService.create(createGenreDto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    if (page && limit) {
      return this.genreService.findAll(+page, +limit);
    }
    return this.genreService.findAll();
  }

  @Get('/by-name')
  findByName(@Query('genreName') genreName: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    if (page && limit) {
      return this.genreService.findRolByName(genreName, +page, +limit);
    }
    return this.genreService.findRolByName(genreName);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.genreService.remove(+id);
  }
}
