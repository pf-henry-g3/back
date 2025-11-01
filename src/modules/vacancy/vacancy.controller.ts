import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('vacancy')
export class VacancyController {
  constructor(private readonly vacancyService: VacancyService) { }

  @Post()
  create(@Body() createVacancyDto: CreateVacancyDto) {
    return this.vacancyService.create(createVacancyDto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    if (page && limit) {
      return this.vacancyService.findAll(+page, +limit);
    }
    return this.vacancyService.findAll();
  }

  @Get('/genre')
  findAllByGenre(@Query('genre') genreName: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    if (page && limit) {
      return this.vacancyService.findAllByGenre(genreName, +page, +limit);
    }
    return this.vacancyService.findAllByGenre(genreName);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vacancyService.findOne(id);
  }


  @Patch('photo/:vacancyId')
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
  update(@Param('id') id: string, @Body() updateVacancyDto: UpdateVacancyDto) {
    return this.vacancyService.update(+id, updateVacancyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vacancyService.remove(+id);
  }
}
