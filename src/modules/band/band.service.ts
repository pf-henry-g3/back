import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Band } from './entities/band.entity';
import { CreateBandDto } from './dto/create-band.dto';

@Injectable()
export class BandService { 
    constructor(
        @InjectRepository(Band)
        private readonly bandRepository: Repository<Band>,
    ) { }

    create(createBandDto: CreateBandDto) {
        const band = this.bandRepository.create(createBandDto);
        return this.bandRepository.save(band);
    }
    async findAll(page: number = 1, limit: number = 30) {
        const [bands, total] = await this.bandRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            data: bands,
            meta: {
                total,
                page,
                limit,
            },
        };
    }

    
}