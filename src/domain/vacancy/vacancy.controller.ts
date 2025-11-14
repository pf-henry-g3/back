import { Controller, Get, Post, Body, Patch, Param, Query, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UseGuards, HttpCode, Req, Delete } from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiParam, ApiProperty, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/Auth.guard';
import { User } from '../user/entities/user.entity';
import { commonResponse } from 'src/common/utils/common-response.constant';
import { VacancyOwnerGuard } from 'src/common/factories/OwnerOrAdmin.factory';

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
  async create(
    @Body() createVacancyDto: CreateVacancyDto,
    @Req() req
  ) {
    const user = req.user as User

    return commonResponse(
      'Vacante Creada',
      await this.vacancyService.create(createVacancyDto, user)
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
  //@ApiBearerAuth()
  //@UseGuards(AuthGuard)
  @HttpCode(200)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string) {

    const pageNum = page ? +page : undefined;
    const limitNum = limit ? +limit : undefined;

    const foundVacancies = await this.vacancyService.findAll(pageNum, limitNum);

    return commonResponse(
      'Vacantes encontradas.',
      foundVacancies.transformedVacancies,
      foundVacancies.meta,
    )
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
  //@ApiBearerAuth()
  //@UseGuards(AuthGuard)
  @HttpCode(200)
  async findOne(
    @Param('id') id: string
  ) {
    return commonResponse(
      'Vacante encontrada.',
      await this.vacancyService.findOne(id)
    );
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
  @UseGuards(AuthGuard, VacancyOwnerGuard())
  @HttpCode(204)
  softDelete(
    @Param('id') id: string
  ) {
    return this.vacancyService.softDelete(id);
  }
}
