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
import { ApiResponse } from 'src/common/utils/api-response';
import { plainToInstance } from 'class-transformer';
import { BandResponseDto } from './dto/band-response.dto';

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

    async create(createBandDto: CreateBandDto, user: User) {
        //Buscamos que la banda no exista
        const bandExisting = await this.bandsRepository.findOneBy({
            bandName: createBandDto.bandName
        })
        if (bandExisting) {
            throw new BadRequestException(`La banda ${createBandDto.bandName} ya existe.`)
        }

        //Buscamos los generos de la DB que coincidan con los recibidos
        const genres = await this.genresRepository.find({
            where: createBandDto.genres.map(name => ({ name })),
        });

        // Validar que existan todos
        if (genres.length !== createBandDto.genres.length) {
            throw new BadRequestException('Uno o más géneros no existen en la base de datos.');
        }

        // Crear la nueva banda
        const newBand = this.bandsRepository.create({
            ...createBandDto,
            formationDate: new Date(createBandDto.formationDate),
            leader: { id: user.id },
            genres,
        })

        await this.bandsRepository.save(newBand);

        return newBand;
    }

    async update(id: string, updatebandDto: UpdateBandDto) {
        const bandExisting = await this.bandsRepository.findOne({
            where: { id },
            relations: {
                genres: true,
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

            const existingGenres = new Set(bandExisting.genres.map(genre => genre.id));

            const genresToMerge = foundGenres.filter(
                genre => !existingGenres.has(genre.id)
            );

            const updatedGenres = [...bandExisting.genres, ...genresToMerge];
            bandExisting.genres = updatedGenres;
        }

        Object.assign(bandExisting, updatebandDto);

        return this.bandsRepository.save(bandExisting);
    }

    async findAll(page: number = Pages.Pages, limit: number = Pages.Limit) {
        const [bands, total] = await this.bandsRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            relations: {
                leader: { roles: true, genres: true },
                genres: true,
                bandMembers: true
            }
        });

        if (!bands) throw new NotFoundException('Bandas no encontrado');

        const transformedBands = plainToInstance(BandResponseDto, bands, {
            excludeExtraneousValues: true,
        })

        return ApiResponse('Bandas encontradas.', transformedBands, { total, page, limit })
    }

    async findOne(id: string) {
        const band = await this.bandsRepository
            .createQueryBuilder('band')
            .leftJoinAndSelect('band.genres', 'genre')
            .leftJoinAndSelect('band.leader', 'leader')
            .leftJoinAndSelect('band.bandMembers', 'bandMember', 'bandMember.departureDate IS NULL')
            .leftJoinAndSelect('bandMember.user', 'memberUser')
            .where('band.id = :id', { id })
            .getOne();

        if (!band) throw new NotFoundException('Banda no encontrada');

        const bandData = {
            id: band.id,
            name: band.bandName,
            description: band.bandDescription,
            formationDate: band.formationDate,
            image: band.urlImage,
            genres: band.genres.map((g) => g.name),
            leader: {
                id: band.leader.id,
                userName: band.leader.userName,
                name: band.leader.name,
                email: band.leader.email,
                aboutMe: band.leader.aboutMe,
                averageRating: band.leader.averageRating,
                country: band.leader.country,
                city: band.leader.city,
            },
            members: band.bandMembers.map((bm) => ({
                id: bm.id,
                entryDate: bm.entryDate,
                user: {
                    id: bm.user.id,
                    userName: bm.user.userName,
                    name: bm.user.name,
                    email: bm.user.email,
                    aboutMe: bm.user.aboutMe,
                    averageRating: bm.user.averageRating,
                    country: bm.user.country,
                    city: bm.user.city,
                },
            })),
        };

        return ApiResponse('Banda encontrada. ', bandData)
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

            newBand.genres = genres;

            await this.bandsRepository.save(newBand);
            console.log(`🎸 Banda "${bandData.bandName}" creada.`);
        }

        console.log('🎉 Precarga de bandas completada.');

    }

    async addOneMember(bandId: string, addMemberDto: AddMemberDto) {
        //Por ahora se agregarán miembors de la banda de a uno con este endpoint
        const band = await this.bandsRepository.findOne({
            where: { id: bandId },
            relations: {
                bandMembers: true
            }
        })
        if (!band) {
            throw new NotFoundException(`Banda no encontrada`)
        }

        const user = await this.usersRepository.findOneBy({ userName: addMemberDto.userName })

        if (!user) throw new NotFoundException(`Usuario ${addMemberDto.userName} no encontrado`)

        const alreadyMember = band.bandMembers.some(
            (bandMember) => bandMember.user.id === user.id && bandMember.departureDate === null,
        );

        if (alreadyMember) throw new BadRequestException(`El usuario ya es miembro activo de la banda.`);

        const newMember = this.memberRepository.create({
            band: { id: band.id },
            user: { id: user.id },
            entryDate: new Date(),
        })

        const savedMember = await this.memberRepository.save(newMember)

        band.bandMembers.push(savedMember);

        await this.bandsRepository.save(band);


        const data = {
            band: band.id,
            newMember: {
                id: savedMember.id,
                entryDate: savedMember.entryDate,
                user: {
                    id: user.id,
                    userName: user.userName,
                    name: user.name,
                    email: user.email,
                    aboutMe: user.aboutMe,
                    averageRating: user.averageRating,
                    country: user.country,
                    city: user.city,
                },
            },
        };

        return ApiResponse('Miembro de la banda agregado. ', data)
    }
}