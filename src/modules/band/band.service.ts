import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

     async findOne(id: string) {
        const band = await this.bandRepository.findOne({
            where: { id },
            relations: {
                bandGenre: true,
                bandMembers: true,
                bandVacancies: true,
                // bandDescription: true,
            },
        });

        if (!band) {
            throw new NotFoundException('Banda no encontrada');
        }

        const { ...bandData } = band;
        return bandData;
    }   

}