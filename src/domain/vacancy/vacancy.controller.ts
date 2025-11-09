import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UseGuards, HttpCode, Req } from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiParam, ApiProperty, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/Auth.guard';
import { User } from '../user/entities/user.entity';

@Controller('vacancy')
export class VacancyController {
  constructor(private readonly vacancyService: VacancyService) { }

  @Post()
  @ApiProperty({
    description: 'Creacion de una nueva vacante',
  })
  @ApiResponse({
    status: 201,
    description: 'Creacion exitosa con retorno de datos.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(201)
  create(
    @Body() createVacancyDto: CreateVacancyDto,
    @Req() req
  ) {
    const user = req.user as User
    return this.vacancyService.create(createVacancyDto, user);
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
  @UseGuards(AuthGuard)
  @HttpCode(200)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string) {
    if (page && limit) {
      return this.vacancyService.findAll(+page, +limit);
    }
    return this.vacancyService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id de la vacante a buscar',
  })
  @ApiResponse({
    status: 200,
    description: 'Busqueda exitosa con retorno de datos.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(200)
  findOne(
    @Param('id') id: string
  ) {
    return this.vacancyService.findOne(id);
  }

  @Patch('photo/:vacancyId')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id de la vacante a actualizar su foto',
  })
  @ApiResponse({
    status: 200,
    description: 'Recurso actualizado con retorno de datos',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  uploadVacancyPhoto(
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
    @Param('vacancyId') vacancyId: string
  ) {
    return this.vacancyService.updateProfilePicture(file, vacancyId);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id de la vacante a actualizar sus datos',
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
    @Body() updateVacancyDto: UpdateVacancyDto
  ) {
    return this.vacancyService.update(+id, updateVacancyDto);
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
  @UseGuards(AuthGuard)
  @HttpCode(204)
  remove(
    @Param('id') id: string
  ) {
    return this.vacancyService.remove(+id);
  }
}
