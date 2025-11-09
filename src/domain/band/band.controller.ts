import { Body, Controller, FileTypeValidator, Get, HttpCode, MaxFileSizeValidator, Param, ParseFilePipe, ParseUUIDPipe, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async findOne(
    @Param('id') id: string
  ) {
    return commonResponse(
      'Banda encontrada.',
      await this.bandsService.findOne(id)
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
}
