import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, HttpCode } from '@nestjs/common';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { ApiBearerAuth, ApiParam, ApiProperty, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/Auth.guard';
import { RolesGuard } from '../../common/guards/Role.guard';
import { Role } from 'src/common/enums/roles.enum';
import { Roles } from 'src/common/decorators/role.decorator';
import { commonResponse } from 'src/common/utils/common-response.constant';

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
  @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(201)
  async create(
    @Body() createGenreDto: CreateGenreDto
  ) {
    return commonResponse(
      'Genero creado exitosamente.',
      await this.genreService.create(createGenreDto),
    )
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
  @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(200)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNum = page ? +page : undefined;
    const limitNum = limit ? +limit : undefined;

    const foundGenres = await this.genreService.findAll(pageNum, limitNum);

    return commonResponse(
      'Generos encontrados.',
      foundGenres.transformedGenres,
      foundGenres.meta,
    )
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
  @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(200)
  async findByName(
    @Query('genreName') genreName: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string) {
    const pageNum = page ? +page : undefined;
    const limitNum = limit ? +limit : undefined;

    const foundGenres = await this.genreService.findGenreByName(genreName, pageNum, limitNum);

    return commonResponse(
      'Generos encontrados.',
      foundGenres.transformedGenres,
      foundGenres.meta,
    )
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id del genero a eliminar de forma logica',
  })
  @ApiResponse({
    status: 204,
    description: 'Recurso eliminado sin retorno de datos',
  })
  @ApiBearerAuth()
  @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(204)
  softDelete(
    @Param('id') id: string
  ) {
    return this.genreService.softDelete(id);
  }
}
