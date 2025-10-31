import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    if (page && limit) {
      return this.roleService.findAll(+page, +limit);
    }
    return this.roleService.findAll();
  }

  @Get('/rol-name')
  findByName(@Query('rolName') rolName: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    if (page && limit) {
      return this.roleService.findRolByName(rolName, +page, +limit);
    }
    return this.roleService.findRolByName(rolName);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }
}
