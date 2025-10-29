import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Band } from './entities/band.entity';
import { CreateBandDto } from './dto/create-band.dto';
import bandsData from '../../data/bands.data.json'
import { User } from '../user/entities/user.entity';
import { Genre } from '../genre/entities/genre.entity';

@Injectable()
export class BandService { 
    constructor(
        @InjectRepository(Band)
        private readonly bandRepository: Repository<Band>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Genre)
        private readonly genreRepository: Repository<Genre>,
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



    async seederBandas() {
        console.log('⏳ Precargando bandas...');
        for (const bandData of bandsData) { 
            const existingBand = await this.bandRepository.findOne({
                where: { bandName: bandData.bandName },
            });
            if (existingBand) {
                console.log(`⚠️ Banda ${bandData.bandName} ya existe, saltando...`);
                continue;
                }

            const leader = await this.userRepository.findOne({
                where: { email: bandData.leaderEmailSeeder },
            });
            if (!leader) {
                console.log(`⚠️ Líder con email ${bandData.leaderEmailSeeder} no encontrado, saltando banda ${bandData.bandName}...`);
                continue;
            }
            
            const genres = (
                await Promise.all(
                    bandData.genresNameSeeder.map(async (genreName) => {
                    return this.genreRepository.findOne({
                        where: { name: genreName },
                    });
                    }),
                )
                ).filter((genre): genre is Genre => genre !== null);

            const newBand = this.bandRepository.create({
                bandName: bandData.bandName,
                leader: leader,
                bandDescription: bandData.bandDescription,
                formationDate: bandData.formationDate,
                urlImage: bandData.bandImage,
            });
            
            newBand.bandGenre = genres;

            await this.bandRepository.save(newBand);
            console.log(`🎸 Banda "${bandData.bandName}" creada.`);
        }

        console.log('🎉 Precarga de bandas completada.');  
        
    }

}