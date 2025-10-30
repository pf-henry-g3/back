import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BandsService } from './band.service';
import { CreateBandDto } from './dto/create-band.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('band')
export class BandController {
  constructor(private readonly bandsService: BandsService) { }

  @Post()
  create(@Body() createBandDto: CreateBandDto) {
    return this.bandsService.create(createBandDto);
    // Aca tengo que definir que datos y como me van a llegar para crear una banda
  }
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    if (page && limit) {
      return this.bandsService.findAll(+page, +limit);
    }
    return this.bandsService.findAll();
  }

  @Get('/genre')
  findAllByGenre(@Query('genre') genreName: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    if (page && limit) {
      return this.bandsService.findAllByGenre(genreName, +page, +limit);
    }
    return this.bandsService.findAllByGenre(genreName);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bandsService.findOne(id);
  }

  @Patch('photo/:bandId')
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
}
