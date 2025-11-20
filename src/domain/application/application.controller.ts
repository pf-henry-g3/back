import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, Req, Query } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApiBearerAuth, ApiParam, ApiProperty, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/Auth.guard';
import { User } from '../user/entities/user.entity';
import { commonResponse } from 'src/common/utils/common-response.constant';
import { ApplicationOwnerGuard } from 'src/common/factories/OwnerOrAdmin.factory';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) { }

  @Post()
  @ApiProperty({
    description: 'Creacion de una nueva postulacion',
  })
  @ApiResponse({
    status: 201,
    description: 'Creacion exitosa con retorno de datos.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(201)
  async create(
    @Body() createApplicationDto: CreateApplicationDto,
    @Req() req
  ) {
    const user = req.user as User;

    return commonResponse(
      'Postulacion creada',
      await this.applicationService.create(user.id, createApplicationDto),
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

    const foundApplications = await this.applicationService.findAll(pageNum, limitNum);

    return commonResponse(
      'Postulaciones encontradas.',
      foundApplications.transformedApplications,
      foundApplications.meta,
    )
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id de la postulacion a buscar',
  })
  @ApiResponse({
    status: 200,
    description: 'Busqueda exitosa con retorno de datos.',
  })
  @HttpCode(200)
  async findOne(
    @Param('id') id: string
  ) {
    return commonResponse(
      'Postulacion encontrada.',
      await this.applicationService.findOne(id)
    );
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id de la postulacion a eliminar de forma fisica',
  })
  @ApiResponse({
    status: 204,
    description: 'Recurso eliminado sin retorno de datos',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, ApplicationOwnerGuard())
  @HttpCode(204)
  softDelete(
    @Param('id') id: string
  ) {
    return this.applicationService.softDelete(id);
  }
}
