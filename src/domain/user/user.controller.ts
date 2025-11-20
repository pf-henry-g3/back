import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UseGuards, HttpCode, Req, NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiParam, ApiProperty, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/Auth.guard';
import { RolesGuard } from '../../common/guards/Role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { UserVerificationService } from './userVerification.service';
import { commonResponse } from 'src/common/utils/common-response.constant';
import { SelfIdOrAdminGuard } from 'src/common/guards/SelfIdOrAdmin.guard';
import { User } from './entities/user.entity';
import { AddInstrumentsDto } from './dto/add-instruments.dto';
import { ApplicationService } from '../application/application.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userVerificationService: UserVerificationService,

  ) { }

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
    description: 'Busqueda exitosa con retorno de datos',
  })
  @HttpCode(200)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: any
  ) {
    const pageNum = page ? +page : undefined;
    const limitNum = limit ? +limit : undefined;

    // Si el usuario está autenticado y es admin, usar DTO de admin
    let forAdmin = false;
    if (req?.user) {
      const userRoles = req.user.roles?.map((r: any) => r.name) || [];
      forAdmin = userRoles.includes(Role.Admin) || userRoles.includes(Role.SuperAdmin);
    }

    const foundUsers = await this.userService.findAll(pageNum, limitNum, forAdmin);

    return commonResponse(
      'Usuarios encontrados.',
      foundUsers.transformedUsers,
      foundUsers.meta,
    )
  }

  @Get('verify')
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'token de verificacion del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Busqueda exitosa con retorno de datos',
  })
  @HttpCode(200)
  verifyEmail(@Query('token') token: string) {
    return this.userVerificationService.verifyEmail(token);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id del usuario a buscar y relaciones',
  })
  @ApiResponse({
    status: 200,
    description: 'Busqueda exitosa con retorno de datos',
  })
  @HttpCode(200)
  async findOne(
    @Param('id') id: string
  ) {
    return commonResponse(
      'Usuario encontrado',
      await this.userService.findOne(id, { relations: ['genres', 'roles', 'leaderOf', 'memberships', 'vacancies', 'musicalInstruments'], throwIfNotFound: true }),
    )
  }

  @Patch('photo/:userId')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id del usuario que actualiza su foto de perfil',
  })
  @ApiResponse({
    status: 200,
    description: 'Recurso actualizado con retorno de datos',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, SelfIdOrAdminGuard)
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  uploadProfilePhoto(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 200000,
            message: 'La imagen debe ser maximo de 200kb'
          }),
          new FileTypeValidator({
            fileType: /(jpg|jpge|png|webp)$/,
          }),
        ]
      }),
    ) file: Express.Multer.File,
    @Param('userId') userId: string
  ) {
    return this.userService.updateProfilePicture(file, userId);
  }

  @Post('instrument')
  @ApiProperty({
    description: 'Instrumentos a agregar, siempre en pares de instrumento y nivel, el instrumento debe existir en la base de datos'
  })
  @ApiResponse({
    status: 200,
    description: 'Recurso actualizado con retorno de datos',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async addInstrument(
    @Req() req,
    @Body() addInstrumentDto: AddInstrumentsDto,
  ) {
    const user = req.user as User;

    return commonResponse(
      'Instrumentos actualizados exitosamente',
      await this.userService.addInstruments(user.id, addInstrumentDto)
    )
  }

  @Patch('ban/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id del usuario a banear',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario baneado exitosamente',
  })
  @ApiBearerAuth()
  @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(200)
  async banUser(
    @Param('id') id: string,
    @Body('reason') reason?: string
  ) {
    return commonResponse(
      'Usuario baneado exitosamente',
      await this.userService.banUser(id, reason)
    );
  }

  @Patch('unban/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id del usuario a desbanear',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario desbaneado exitosamente',
  })
  @ApiBearerAuth()
  @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(200)
  async unbanUser(
    @Param('id') id: string
  ) {
    return commonResponse(
      'Usuario desbaneado exitosamente',
      await this.userService.unbanUser(id)
    );
  }

  @Patch('relations/:relationName')
  @ApiParam({
    name: 'relationName',
    required: true,
    description: 'Nombre de la relacion M:N a remover [roles, genres]',
    example: 'roles'
  })
  @ApiQuery({
    name: 'name',
    required: true,
    description: 'Nombre unico de la entidad',
    example: 'Artist'
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado con retorno de datos',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async removeManytoMany(
    @Req() req,
    @Param('relationName') relationName: 'roles' | 'genres',
    @Query('name') itemName: string,
  ) {
    if (!itemName) {
      throw new NotFoundException(`Se requiere el parámetro 'name' para eliminar la relación.`);
    }

    const user = req.user as User;

    return commonResponse(
      'Usuario actualizado correctamente',
      await this.userService.removeManyToManyRelation(user.id, relationName, itemName)
    )
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id del usuario que actualiza sus datos',
  })
  @ApiResponse({
    status: 200,
    description: 'Recurso actualizado con retorno de datos',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, SelfIdOrAdminGuard)
  @HttpCode(200)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any
  ) {
    return await this.userService.update(id, updateUserDto, req.user);
  }

  @Delete('instruments')
  @ApiQuery({
    name: 'instrumentName',
    description: 'Instrumentos a eliminar, es unico',
    example: 'Guitarra'
  })
  @ApiResponse({
    status: 204,
    description: 'Recurso eliminado sin retorno de datos',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(204)
  removeInstrument(
    @Req() req,
    @Query('instrumentName') instrumentName: string,
  ) {
    const user = req.user as User;

    return this.userService.removeMusicalInstrument(user.id, instrumentName);
  }

  @Delete('membership')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(204)
  leaveABand(
    @Req() req,
    @Query('bandName') bandName: string,
  ) {
    const user = req.user as User;

    return this.userService.leaveABand(user, bandName);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id del usuario eliminar de forma logica',
  })
  @ApiResponse({
    status: 204,
    description: 'Recurso eliminado sin retorno de datos',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, SelfIdOrAdminGuard)
  @HttpCode(204)
  softDelete(
    @Param('id') id: string
  ) {
    return this.userService.softDelete(id);
  }


  @Get('/getApplications/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id del usuario a consultar',
  })
  @ApiResponse({
    status: 200,
    description: 'Recurso encontrado con retorno de datos',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, SelfIdOrAdminGuard)
  @HttpCode(200)
  async findByUser(@Param('id', ParseUUIDPipe) userId: string) {
    return this.userService.getApplications(userId);
  }

}
