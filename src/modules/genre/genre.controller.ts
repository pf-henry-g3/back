import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode } from '@nestjs/common';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { ApiBearerAuth, ApiParam, ApiProperty, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/Auth.guard';

@Controller('genre')
export class GenreController {
  constructor(private readonly genreService: GenreService) { }

  @Post()
  @ApiProperty({
    description: 'Creacion de un nuevo genero',
  })
  @ApiResponse({
    status: 201,
    description: 'Creacion exitosa con retorno de datos.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(201)
  create(
    @Body() createGenreDto: CreateGenreDto
  ) {
    return this.genreService.create(createGenreDto);
  }

  @Get()
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
    description: 'Busqueda exitosa con retorno de datos.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(200)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    if (page && limit) {
      return this.genreService.findAll(+page, +limit);
    }
    return this.genreService.findAll();
  }

  @Get('/by-name')
  @ApiQuery({
    name: 'genreName',
    required: true,
    description: 'Genero a buscar en la BDD',
    example: 'Artist',
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
    description: 'Busqueda exitosa con retorno de datos.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(200)
  findByName(
    @Query('genreName') genreName: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string) {
    if (page && limit) {
      return this.genreService.findRolByName(genreName, +page, +limit);
    }
    return this.genreService.findRolByName(genreName);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id de la vacante a eliminar de forma fisica',
  })
  @ApiResponse({
    status: 204,
    description: 'Recurso eliminado sin retorno de datos',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(204)
  remove(
    @Param('id') id: string
  ) {
    return this.genreService.remove(+id);
  }
}
