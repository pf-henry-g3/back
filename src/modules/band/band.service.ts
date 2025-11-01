import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Band } from './entities/band.entity';
import { CreateBandDto } from './dto/create-band.dto';
import bandsData from '../../data/bands.data.json'
import { User } from '../user/entities/user.entity';
import { Genre } from '../genre/entities/genre.entity';
import { Pages } from 'src/enums/pages.enum';
import { FileUploadService } from '../file-upload/file-upload.service';
import { AbstractFileUploadService } from '../file-upload/file-upload.abstract.service';
import { UpdateBandDto } from './dto/update-band.dto';
import { BandMember } from './entities/bandMember.entity';
import { AddMemberDto } from './dto/add-member.dto';
import { ApiResponse } from 'src/helper/api-response';

@Injectable()
export class BandsService extends AbstractFileUploadService<Band> {
    constructor(
        @InjectRepository(Band)
        private readonly bandsRepository: Repository<Band>,

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        @InjectRepository(Genre)
        private readonly genresRepository: Repository<Genre>,

        @InjectRepository(BandMember)
        private readonly memberRepository: Repository<BandMember>,

        fileUploadService: FileUploadService,
    ) { super(fileUploadService, bandsRepository) }

    async create(createBandDto: CreateBandDto) {
        const bandExisting = await this.bandsRepository.findOneBy({
            bandName: createBandDto.name
        })
        if (bandExisting) {
            throw new BadRequestException(`La banda ${createBandDto.name} ya existe.`)
        }
        const genres = (
            await Promise.all(
                createBandDto.genreIds.map(async (genre) => {
                    return this.genresRepository.findOne({
                        where: { id: genre },
                    });
                }),
            )
        ).filter((genre): genre is Genre => genre !== null);

        const band = this.bandsRepository.create({
            bandName: createBandDto.name,
            bandDescription: createBandDto.description,
            formationDate: new Date(createBandDto.formationDate)
        });

        //El usuario se genera random de la DB (Solo para agilizar en desarrollo, luego lo hacemos con el usuario logueado)
        const allUsers = await this.usersRepository.find();
        const randomLeader = allUsers[Math.floor(Math.random() * allUsers.length)]
        band.leader = randomLeader

        band.bandGenre = genres;

        return this.bandsRepository.save(band);
    }

    async update(id: string, updatebandDto: UpdateBandDto) {
        const bandExisting = await this.bandsRepository.findOne({
            where: { id },
            relations: {
                bandGenre: true,
                bandMembers: true
            }
        });
        if (!bandExisting) {
            throw new NotFoundException(`Banda con id ${id} no fue encontrada`);
        }

        if (updatebandDto.newGenres && updatebandDto.newGenres.length > 0) {
            const foundGenres = await this.genresRepository.find({
                where: updatebandDto.newGenres?.map((name) => ({ name }))
            });

            if (foundGenres.length !== updatebandDto.newGenres?.length) {
                const foundNames = new Set(foundGenres.map(role => role.name)); //Set de roles validos
                const notFoundNames = updatebandDto.newGenres.filter(name => !foundNames.has(name)); //Comparacion, devuelve los roles invalidos

                throw new BadRequestException(`Algunos generos agregados no existen. Generos invalidos: ${notFoundNames.join(', ')}`)
            }

            const existingGenres = new Set(bandExisting.bandGenre.map(genre => genre.id));

            const genresToMerge = foundGenres.filter(
                genre => !existingGenres.has(genre.id)
            );

            const updatedGenres = [...bandExisting.bandGenre, ...genresToMerge];
            bandExisting.bandGenre = updatedGenres;
        }

        Object.assign(bandExisting, updatebandDto);

        return this.bandsRepository.save(bandExisting);
    }

    async findAll(page: number = Pages.Pages, limit: number = Pages.Limit) {
        const [bands, total] = await this.bandsRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            relations: {
                bandGenre: true,
                bandMembers: true
            }
        });

        if (!bands) throw new NotFoundException('Bandas no encontrado');

        return ApiResponse('Bandas encontradas.', bands, { total, page, limit })
    }

    async findOne(id: string) {
        const band = await this.bandsRepository.findOne({
            where: { id },
            relations: {
                bandGenre: true,
                bandMembers: true,
                // bandDescription: true,
            },
        });

        if (!band) {
            throw new NotFoundException('Banda no encontrada');
        }

        const { ...bandData } = band;

        return ApiResponse('Bandas encontradas. ', bandData)
    }

    async updateProfilePicture(file: Express.Multer.File, bandId: string) {
        const band = await this.bandsRepository.findOneBy({ id: bandId });

        if (!band) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return this.uploadImage(file, bandId);
    }

    async seederBandas() {
        console.log('⏳ Precargando bandas...');
        for (const bandData of bandsData) {
            const existingBand = await this.bandsRepository.findOne({
                where: { bandName: bandData.bandName },
            });
            if (existingBand) {
                console.log(`⚠️ Banda ${bandData.bandName} ya existe, saltando...`);
                continue;
            }

            const leader = await this.usersRepository.findOne({
                where: { email: bandData.leaderEmailSeeder },
            });
            if (!leader) {
                console.log(`⚠️ Líder con email ${bandData.leaderEmailSeeder} no encontrado, saltando banda ${bandData.bandName}...`);
                continue;
            }

            const genres = (
                await Promise.all(
                    bandData.genresNameSeeder.map(async (genreName) => {
                        return this.genresRepository.findOne({
                            where: { name: genreName },
                        });
                    }),
                )
            ).filter((genre): genre is Genre => genre !== null);

            const newBand = this.bandsRepository.create({
                bandName: bandData.bandName,
                leader: leader,
                bandDescription: bandData.bandDescription,
                formationDate: bandData.formationDate
            });

            newBand.bandGenre = genres;

            await this.bandsRepository.save(newBand);
            console.log(`🎸 Banda "${bandData.bandName}" creada.`);
        }

        console.log('🎉 Precarga de bandas completada.');

    }

    async addOneMember(bandId: string, addMemberDto: AddMemberDto) {
        //Por ahora se agregarán miembors de la banda de a uno con este endpoint
        const band = await this.bandsRepository.findOne({
            where: {
                id: bandId
            },
            relations: {
                bandMembers: true
            }
        })
        if (!band) {
            throw new NotFoundException(`No se encontró una banda con el id especificado`)
        }

        const user = await this.usersRepository.findOneBy({ userName: addMemberDto.userName })
        if (!user) {
            throw new NotFoundException(`Usuario ${addMemberDto.userName} no encontrado`)
        }

        const newMember = this.memberRepository.create({
            band: band,
            user: user,
            entryDate: new Date()
        })
        const bandMember = await this.memberRepository.save(newMember)

        band.bandMembers.push(bandMember)
        await this.bandsRepository.save(band);


        const data = {
            band: band.id,
            members: band.bandMembers,
            newMember: user.id

        }

        return ApiResponse('Miembro de la banda agregado. ', data)
    }
}