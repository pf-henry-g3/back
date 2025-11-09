import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, HttpCode } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { ApiBearerAuth, ApiParam, ApiProperty, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/Auth.guard';
import { RolesGuard } from '../../common/guards/Role.guard';
import { Role } from 'src/common/enums/roles.enum';
import { Roles } from 'src/common/decorators/role.decorator';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Post()
  @ApiProperty({
    description: 'Creacion de un nuevo rol',
  })
  @ApiResponse({
    status: 201,
    description: 'Creacion exitosa con retorno de datos.',
  })
  @ApiBearerAuth()
  // @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(201)
  create(
    @Body() createRoleDto: CreateRoleDto
  ) {
    return this.roleService.create(createRoleDto);
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
  // @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(200)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    if (page && limit) {
      return this.roleService.findAll(+page, +limit);
    }
    return this.roleService.findAll();
  }

  @Get('/by-name')
  @ApiQuery({
    name: 'rolName',
    required: true,
    description: 'Rol a buscar en la BDD',
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
  // @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(200)
  findByName(
    @Query('rolName') rolName: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string) {
    if (page && limit) {
      return this.roleService.findRolByName(rolName, +page, +limit);
    }
    return this.roleService.findRolByName(rolName);
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
  // @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(204)
  remove(
    @Param('id') id: string
  ) {
    return this.roleService.remove(+id);
  }
}
