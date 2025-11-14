import { Controller, Get, Post, Body, Patch, Param, Delete, Query, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { User } from '../user/entities/user.entity';
import { Band } from '../band/entities/band.entity';
import { Vacancy } from '../vacancy/entities/vacancy.entity';
import { ADMIN_ENTITY_MAP } from './constants/entity-map.constant';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { commonResponse } from 'src/common/utils/common-response.constant';
import { EntityName } from 'src/common/enums/entity-names.enum';
import { Role } from 'src/common/enums/roles.enum';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('entities/:entityType')
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

    return this.adminService.findHistoricalRelations(
      relationConfig.entity,
      relationConfig.relationField,
      id,
      deleted,
      pageNum,
      limitNum,
    )
  }

  @Delete('soft-delete/:entityType/:id')
  softDelete(
    @Param('entityType') entityType: EntityName,
    @Param('id') id: string,
  ) {
    const mapping = ADMIN_ENTITY_MAP[entityType];

    if (!mapping) throw new NotFoundException(`Entidad ${entityType} no encontrada`);

    return this.adminService.softDeleteEntity(mapping.entity, id);
  }

  //protegido con superAdmin
  @Patch('/:id')
  async newAdmin(
    @Param('id') id: string,
  ) {
    const newAdmin = await this.adminService.newUserAdmin(id, Role.Admin);

    return commonResponse(
      'Nuevo admin agregado',
      newAdmin,
    )
  }

  //protegido con superAdmin
  @Delete('hard-delete/:entityType/:id')
  hardDelete(
    @Param('entityType') entityType: EntityName,
    @Param('id') id: string,
  ) {
    const mapping = ADMIN_ENTITY_MAP[entityType];

    if (!mapping) throw new NotFoundException(`Entidad ${entityType} no encontrada`);

    return this.adminService.hardDeleteEntity(mapping.entity, id);
  }
}
