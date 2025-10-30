import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    if (page && limit) {
      return this.userService.findAll(+page, +limit);
    }
    return this.userService.findAll();
  }

  @Get('genre')
  findAllByGenre(@Query('genre') genreName: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    if (page && limit) {
      return this.userService.findAllByGenre(genreName, +page, +limit);
    }
    return this.userService.findAllByGenre(genreName);
  }

  @Get('deleted')
  findAllIncludingDeleted(@Query('page') page?: string, @Query('limit') limit?: string) {
    if (page && limit) {
      return this.userService.findAllIncludingDeleted(+page, +limit);
    }
    return this.userService.findAllIncludingDeleted();
  }

  @Get('deleted/only-deleted')
  findAllDeletedUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    if (page && limit) {
      return this.userService.findAllDeletedUsers(+page, +limit);
    }
    return this.userService.findAllDeletedUsers();
  }

  @Get('delete/:id')
  findOneDeletedUser(@Param('id') id: string) {
    return this.userService.findOneDeletedUser(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }


  @Patch('photo/:userId')
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
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.userService.softDelete(id);
  }
}
