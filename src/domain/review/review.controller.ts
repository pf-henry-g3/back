import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, Req, Query, MaxFileSizeValidator, FileTypeValidator, ParseFilePipe, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ApiBearerAuth, ApiParam, ApiProperty, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/Auth.guard';
import { User } from '../user/entities/user.entity';
import { commonResponse } from 'src/common/utils/common-response.constant';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReviewOwnerGuard } from 'src/common/factories/OwnerOrAdmin.factory';
import { RolesGuard } from 'src/common/guards/Role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/roles.enum';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) { }

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
    @Body() createReviewDto: CreateReviewDto,
    @Req() req
  ) {
    const user = req.user as User

    return commonResponse(
      'Review creada',
      await this.reviewService.create(createReviewDto, user),
    )
  }

  @Get('admin/all')
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
  @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(200)
  async findAllForAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? +page : undefined;
    const limitNum = limit ? +limit : undefined;

    const foundReviews = await this.reviewService.findAll(pageNum, limitNum);

    return commonResponse(
      'Reviews encontradas',
      foundReviews.tranformedReviews,
      foundReviews.meta,
    );
  }

  @Get(':userRole')
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
  @ApiQuery({
    name: 'role',
    required: true,
    description: '"owner" para las propias y "receptor" para las recibidas',
    example: 'owner',
  })
  @ApiResponse({
    status: 200,
    description: 'Busqueda exitosa con retorno de datos.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async findAll(
    @Req() req,
    @Query('role') role: 'owner' | 'receptor',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? +page : undefined;
    const limitNum = limit ? +limit : undefined;
    const owner = req.user as User

    const foundReviews = await this.reviewService.findAllByUserRole(role, owner, pageNum, limitNum,)

    return commonResponse(
      'Reviews encontradas',
      foundReviews.tranformedReviews,
      foundReviews.meta,
    )
  }

  @Patch('photo/:reviewId')
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
  @UseGuards(AuthGuard, ReviewOwnerGuard())
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
    @Param('reviewId') reviewId: string
  ) {
    return this.reviewService.updateProfilePicture(file, reviewId);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id de la review a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Recurso actualizado con retorno de datos',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, ReviewOwnerGuard())
  @HttpCode(200)
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto
  ) {
    return commonResponse(
      'Datos Actualizados',
      await this.reviewService.update(id, updateReviewDto),
    )
  }
}
