import { Controller, Get, Body, Patch, Param, Delete, Query, NotFoundException, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ADMIN_ENTITY_MAP } from './constants/entity-map.constant';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { commonResponse } from 'src/common/utils/common-response.constant';
import { EntityName } from 'src/common/enums/entity-names.enum';
import { Role } from 'src/common/enums/roles.enum';
import { BanUserDto } from './dto/ban-user.dto';
import { ApiBearerAuth, ApiParam, ApiProperty, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SendMassEmailDto } from '../user/dto/send-mass-email.dto';
import { AuthGuard } from 'src/common/guards/Auth.guard';
import { RolesGuard } from 'src/common/guards/Role.guard';
import { Roles } from 'src/common/decorators/role.decorator';

// @ApiBearerAuth()
// @Roles(Role.Admin, Role.SuperAdmin)
// @UseGuards(AuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('entities/:entityType')
  @ApiParam({
    name: 'entityType',
    required: true,
    description: 'Tipo de entidad consultada, siempre en plural y minusculas: users, bands, vacancies, genres, roles, reviews, bandMembers, artistInstruments',
    example: 'users'
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
  @ApiQuery({
    name: 'deleted',
    required: false,
    description: 'Si es true retorna entidades borradas de forma logica',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Busqueda exitosa con retorno de datos',
  })
  @HttpCode(200)
  async findAll(
    @Param('entityType') entityType: EntityName,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('deleted') deleted: boolean = false,
  ) {
    const pageNum = page ? +page : undefined;
    const limitNum = limit ? +limit : undefined;

    //mapeamos el tipo de entidad y su responseDTO
    const mapping = ADMIN_ENTITY_MAP[entityType];

    if (!mapping) throw new NotFoundException(`Entidad ${entityType} no encontrada`);

    const mappedRelations = mapping.defaultRelations || [];

    //llamamos al servicio generico
    const result = await this.adminService.findEntites(mapping.entity, pageNum, limitNum, deleted, { relations: mappedRelations });

    //evitamos que typescript piense que le pasamos un constructor invalido
    const ResponseDtoClass = mapping.responseDto as ClassConstructor<any>;

    //transformamos los datos evitando datos sensibles
    const transformedData = plainToInstance(
      ResponseDtoClass,
      result.data,
      { excludeExtraneousValues: true }
    );

    return commonResponse(
      'Entidades encontradas.',
      transformedData,
      result.meta,
    )
  }

  @Get('entities/:entityType/:id')
  @ApiParam({
    name: 'entityType',
    required: true,
    description: 'Tipo de entidad consultada, siempre en plural y minusculas: users, bands, vacancies, genres, roles, reviews, bandMembers, artistInstruments',
    example: 'users'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID de la entidad a consultar',
  })
  @ApiQuery({
    name: 'deleted',
    required: false,
    description: 'Si es true retorna entidades borradas de forma logica',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Busqueda exitosa con retorno de datos',
  })
  @HttpCode(200)
  async findOne(
    @Param('entityType') entityType: EntityName,
    @Param('id') id: string,
    @Query('deleted') deleted: boolean = false,
  ) {
    const mapping = ADMIN_ENTITY_MAP[entityType];

    if (!mapping) throw new NotFoundException(`Entidad ${entityType} no encontrada`);

    const mappedRelations = mapping.defaultRelations || [];

    const result = await this.adminService.findOneEntityByID(mapping.entity, id, deleted, { relations: mappedRelations });

    const ResponseDtoClass = mapping.responseDto as ClassConstructor<any>;

    const transformedData = plainToInstance(
      ResponseDtoClass,
      result,
      { excludeExtraneousValues: true }
    );

    return commonResponse(
      'Entidades encontradas.',
      transformedData,
    )
  }

  @Get('history/:entityType/:id/:relationName')
  @ApiParam({
    name: 'entityType',
    required: true,
    description: 'Tipo de entidad consultada, siempre en plural y minusculas: users, bands, vacancies, genres, roles, reviews, bandMembers, artistInstruments',
    example: 'users'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID de la entidad especifica a consultar',
  })
  @ApiParam({
    name: 'relationName',
    required: true,
    description: 'nombre de la relacion: users[leaderOf, memberships, vacancies, musicalInstruments, roles, genres] bands[bandMembers, genres] vacancies[genres, musicalInstruments] instruments[artistMusicalInstrument, vacancies] roles[users] genres[users, bands, vacancies]',
    example: 'genres'
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
  @ApiQuery({
    name: 'deleted',
    required: false,
    description: 'Si es true retorna entidades borradas de forma logica',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Busqueda exitosa con retorno de datos',
  })
  @HttpCode(200)
  async findHistory(
    @Param('entityType') entityType: EntityName,
    @Param('id') id: string,
    @Param('relationName') relationName: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('deleted') deleted: boolean = false,
  ) {
    const pageNum = page ? +page : undefined;
    const limitNum = limit ? +limit : undefined;

    const mapping = ADMIN_ENTITY_MAP[entityType];

    if (!mapping) throw new NotFoundException(`Entidad ${entityType} no encontrada`);

    const relationConfig = mapping.historyRelations[relationName];

    if (!relationConfig) throw new NotFoundException(`Relación histórica ${relationName} no definida.`);

    const result = await this.adminService.findHistoricalRelations(
      relationConfig,
      id,
      deleted,
      pageNum,
      limitNum,
    )

    const ResponseDtoClass = relationConfig.responseDto as ClassConstructor<any>;

    const transformedData = plainToInstance(
      ResponseDtoClass,
      result.data,
      { excludeExtraneousValues: true }
    );

    return commonResponse(
      'Historial encontrado',
      transformedData,
      result.meta,
    );
  }

  @Post('admin/send-mass-email')
  @ApiProperty({
    description: 'Envío masivo de emails a todos los usuarios',
  })
  @ApiResponse({
    status: 200,
    description: 'Emails enviados exitosamente',
  })
  @HttpCode(200)
  async sendMassEmail(
    @Body() sendMassEmailDto: SendMassEmailDto
  ) {
    return commonResponse(
      'Emails enviados',
      await this.adminService.sendMassEmail(
        sendMassEmailDto.subject,
        sendMassEmailDto.body
      ),
    );
  }

  //protegido con superAdmin
  @Patch('/:id')
  // @Roles(Role.SuperAdmin)
  // @UseGuards(RolesGuard)
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID del usuario a hacer Admin',
  })
  @ApiResponse({
    status: 201,
    description: 'Actualizacion exitosa con retorno de datos',
  })
  async newAdmin(
    @Param('id') id: string,
  ) {
    const newAdmin = await this.adminService.newAdmin(id, Role.Admin);

    return commonResponse(
      'Nuevo admin agregado',
      newAdmin,
    )
  }

  @Patch('ban/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID del usuario a hacer Admin',
  })
  @ApiResponse({
    status: 204,
    description: 'Actualizacion exitosa sin retorno de datos',
  })
  @HttpCode(204)
  async banUser(
    @Param('id') id: string,
    @Body() reason: BanUserDto,
  ) {
    const banedUser = await this.adminService.banUser(id, reason);

    return commonResponse(
      'Usuario baneado exitosamente y borrado de forma logica del sistema',
      banedUser,
    )
  }

  @Delete('soft-delete/:entityType/:id')
  @ApiParam({
    name: 'entityType',
    required: true,
    description: 'Tipo de entidad consultada, siempre en plural y minusculas: users, bands, vacancies, genres, roles, reviews, bandMembers, artistInstruments',
    example: 'users'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID del usuario a hacer Admin',
  })
  @ApiResponse({
    status: 204,
    description: 'Recurso eliminado de forma logica sin retorno de datos',
  })
  @HttpCode(204)
  softDelete(
    @Param('entityType') entityType: EntityName,
    @Param('id') id: string,
  ) {
    const mapping = ADMIN_ENTITY_MAP[entityType];

    if (!mapping) throw new NotFoundException(`Entidad ${entityType} no encontrada`);

    return this.adminService.softDeleteEntity(mapping.entity, id);
  }

  //protegido con superAdmin
  @Delete('hard-delete/:entityType/:id')
  // @Roles(Role.SuperAdmin)
  // @UseGuards(RolesGuard)
  @ApiParam({
    name: 'entityType',
    required: true,
    description: 'Tipo de entidad consultada, siempre en plural y minusculas: users, bands, vacancies, genres, roles, reviews, bandMembers, artistInstruments',
    example: 'users'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID del usuario a hacer Admin',
  })
  @ApiResponse({
    status: 204,
    description: 'Recurso eliminado de forma logica sin retorno de datos',
  })
  @HttpCode(204)
  hardDelete(
    @Param('entityType') entityType: EntityName,
    @Param('id') id: string,
  ) {
    const mapping = ADMIN_ENTITY_MAP[entityType];

    if (!mapping) throw new NotFoundException(`Entidad ${entityType} no encontrada`);

    return this.adminService.hardDeleteEntity(mapping.entity, id);
  }
}
