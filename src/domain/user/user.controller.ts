import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UseGuards, HttpCode } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiParam, ApiProperty, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/Auth.guard';
import { RolesGuard } from '../../common/guards/Role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { SelfIdOrAdminGuard } from '../../common/guards/SelfIdOrAdmin.guard'
import { UserVerificationService } from './userVerification.service';

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
  @ApiBearerAuth()
  // @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(200)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    if (page && limit) {
      return this.userService.findAll(+page, +limit);
    }
    return this.userService.findAll();
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

  @Post('send-verification')
  @ApiProperty({
    description: 'Reenviar email al usuario',
  })
  @ApiResponse({
    status: 204,
    description: 'Recurso creado sin retorno de datos',
  })
  @HttpCode(204)
  resendVerification(@Body('email') email: string) {
    return this.userVerificationService.sendEmail(email);
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
  @ApiBearerAuth()
  // @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(200)
  findOne(
    @Param('id') id: string
  ) {
    return this.userService.findOne(id, { relations: ['genres'], throwIfNotFound: true });
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
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  @HttpCode(200)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.userService.update(id, updateUserDto);
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
  @UseGuards(AuthGuard)
  @HttpCode(204)
  softDelete(
    @Param('id') id: string
  ) {
    return this.userService.softDelete(id);
  }
}

//Rutas de Admin o Super Admin

// @Get('deleted')
// findAllIncludingDeleted(@Query('page') page?: string, @Query('limit') limit?: string) {
//   if (page && limit) {
//     return this.userService.findAllIncludingDeleted(+page, +limit);
//   }
//   return this.userService.findAllIncludingDeleted();
// }

// @Get('deleted/only-deleted')
// findAllDeletedUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
//   if (page && limit) {
//     return this.userService.findAllDeletedUsers(+page, +limit);
//   }
//   return this.userService.findAllDeletedUsers();
// }

// @Get('delete/:id')
// findOneDeletedUser(@Param('id') id: string) {
//   return this.userService.findOneDeletedUser(id);
