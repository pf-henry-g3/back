import { Body, Controller, Delete, FileTypeValidator, Get, HttpCode, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, ParseUUIDPipe, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { BandsService } from './band.service';
import { CreateBandDto } from './dto/create-band.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateBandDto } from './dto/update-band.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ApiBearerAuth, ApiParam, ApiProperty, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/Auth.guard';
import { User } from '../user/entities/user.entity';
import { commonResponse } from 'src/common/utils/common-response.constant';
import { BandOwnerGuard } from 'src/common/factories/OwnerOrAdmin.factory';

@Controller('band')
export class BandController {
  constructor(private readonly bandsService: BandsService) { }

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
    @Body() createBandDto: CreateBandDto,
    @Req() req
  ) {
    const user = req.user as User

    return commonResponse(
      'Banda Creada',
      await this.bandsService.create(createBandDto, user)
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
    @Query('limit') limit?: string) {
    const pageNum = page ? +page : undefined;
    const limitNum = limit ? +limit : undefined;

    const foundBands = await this.bandsService.findAll(pageNum, limitNum);

    return commonResponse(
      'Bandas encontradas.',
      foundBands.transformedBands,
      foundBands.meta
    );
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id de la banda a buscar',
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
      'Banda encontrada.',
      await this.bandsService.findOne(id)
    );
  }

  @Get('bandOfUser/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id de la usuario dueño de bandas a buscar',
  })
  @ApiResponse({
    status: 200,
    description: 'Busqueda exitosa con retorno de datos.',
  })
  //@ApiBearerAuth()
  //@UseGuards(AuthGuard)
  @HttpCode(200)
  async findBandsByUser(
    @Param('id') id: string
  ) {
    return commonResponse(
      'Bandas encontradas.',
      await this.bandsService.findBandsByUser(id)
    );
  }

  @Patch('photo/:bandId')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id de la banda a actualizar su foto',
  })
  @ApiResponse({
    status: 200,
    description: 'Recurso actualizado con retorno de datos',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, BandOwnerGuard())
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  uploadBandPhoto(
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
    @Param('bandId') bandId: string
  ) {
    return this.bandsService.updateProfilePicture(file, bandId);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id de la banda a actualizar sus datos',
  })
  @ApiResponse({
    status: 200,
    description: 'Recurso actualizado con retorno de datos',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, BandOwnerGuard())
  @HttpCode(200)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatebandDto: UpdateBandDto) {
    return commonResponse(
      'Datos actualizados',
      await this.bandsService.update(id, updatebandDto)
    )
  }

  @Post('addMember/:id')
  @ApiProperty({
    description: 'Agregar un nuevo miembro a la banda',
  })
  @ApiResponse({
    status: 200,
    description: 'Actualizacion exitosa con retorno de datos.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, BandOwnerGuard())
  @HttpCode(200)
  async addMember(
    @Param('id', ParseUUIDPipe) bandId: string,
    @Body() addMemberDto: AddMemberDto
  ) {
    return commonResponse(
      'Miembro agregado.',
      await this.bandsService.addOneMember(bandId, addMemberDto)
    );
  }

  @Patch('changeLeader/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID de la banda a actualizar',
  })
  @ApiQuery({
    name: 'newLeaderUserName',
    required: true,
    description: 'Username del nuevo lider',
  })
  @ApiResponse({
    status: 200,
    description: 'Actualizacion exitosa con retorno de datos.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, BandOwnerGuard())
  @HttpCode(200)
  async changeLeader(
    @Param('id', ParseUUIDPipe) bandId: string,
    @Query('newLeaderUserName') newLeaderUserName: string,
    @Req() req,
  ) {
    const user = req.user as User;

    return commonResponse(
      'Nuevo lider actualizado.',
      await this.bandsService.changeLeader(user.id, bandId, newLeaderUserName)
    )

  }

  @Delete('genres/:id/:genreName')
  @ApiParam({
    name: 'genreName',
    required: true,
    description: 'Nombre unico del genero a eliminar',
    example: 'Rock'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id de la banda a modificar',
  })
  @ApiResponse({
    status: 200,
    description: 'Banda actualizada con retorno de datos',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, BandOwnerGuard())
  async removeManytoMany(
    @Param('genreName') genreName: string,
    @Param('id') id: string,
  ) {
    if (!genreName) {
      throw new NotFoundException(`Se requiere el parámetro 'genreName' para eliminar la relación.`);
    }

    return commonResponse(
      'Banda actualizado correctamente',
      await this.bandsService.removeManyToManyRelation(id, genreName)
    )
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id de la banda a eliminar de forma lógica',
  })
  @ApiResponse({
    status: 204,
    description: 'Recurso eliminado sin retorno de datos',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, BandOwnerGuard())
  @HttpCode(204)
  async softDelete(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    await this.bandsService.softDelete(id);
  }
}
