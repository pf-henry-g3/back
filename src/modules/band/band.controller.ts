import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BandService } from './band.service';
import { CreateBandDto } from './dto/create-band.dto';

@Controller('band')
export class BandController {
    constructor(private readonly bandService: BandService) { }

    @Post()
      create(@Body() createBandDto: CreateBandDto) {
        return this.bandService.create(createBandDto);
        // Aca tengo que definir que datos y como me van a llegar para crear una banda
      }    
 }
