import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, Query } from '@nestjs/common';
import { MusicalInstrumentService } from './musical-instrument.service';
import { CreateMusicalInstrumentDto } from './dto/create-musical-instrument.dto';
import { ApiBearerAuth, ApiParam, ApiProperty, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Role } from 'src/common/enums/roles.enum';
import { Roles } from 'src/common/decorators/role.decorator';
import { AuthGuard } from 'src/common/guards/Auth.guard';
import { RolesGuard } from 'src/common/guards/Role.guard';
import { commonResponse } from 'src/common/utils/common-response.constant';

@Controller('musical-instrument')
@ApiBearerAuth()
@Roles(Role.Admin, Role.SuperAdmin)
@UseGuards(AuthGuard, RolesGuard)
export class MusicalInstrumentController {
  constructor(private readonly musicalInstrumentService: MusicalInstrumentService) { }

  @Post()
  @ApiProperty({
    description: 'Creacion de un nuevo instrumento',
  })
  @ApiResponse({
    status: 201,
    description: 'Creacion exitosa con retorno de datos.',
  })
  @HttpCode(201)
  async create(
    @Body() createMusicalInstrumentDto: CreateMusicalInstrumentDto
  ) {
    return commonResponse(
      'Intrumento creado exitosamente.',
      await this.musicalInstrumentService.create(createMusicalInstrumentDto),
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
  @HttpCode(200)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNum = page ? +page : undefined;
    const limitNum = limit ? +limit : undefined;

    const foundIntruements = await this.musicalInstrumentService.findAll(pageNum, limitNum);

    return commonResponse(
      'Instrumentos encontrados.',
      foundIntruements.transformedInstruments,
      foundIntruements.meta,
    )
  }

  @Get('/by-name')
  @ApiQuery({
    name: 'genreName',
    required: true,
    description: 'Instrumento a buscar en la BDD',
    example: 'Guitarra',
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
  @HttpCode(200)
  async findByName(
    @Query('genreName') genreName: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string) {
    const pageNum = page ? +page : undefined;
    const limitNum = limit ? +limit : undefined;

    const foundIntruements = await this.musicalInstrumentService.findInstrumentsByName(genreName, pageNum, limitNum);

    return commonResponse(
      'Instrumentos encontrados.',
      foundIntruements.transformedInstruments,
      foundIntruements.meta,
    )
  }
}
