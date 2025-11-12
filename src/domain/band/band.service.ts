import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Band } from './entities/band.entity';
import { CreateBandDto } from './dto/create-band.dto';
import bandsData from '../../data/bands.data.json'
import { User } from '../user/entities/user.entity';
import { Genre } from '../genre/entities/genre.entity';
import { Pages } from 'src/common/enums/pages.enum';
import { FileUploadService } from '../../core/file-upload/file-upload.service';
import { AbstractFileUploadService } from '../../core/file-upload/file-upload.abstract.service';
import { UpdateBandDto } from './dto/update-band.dto';
import { BandMember } from './entities/bandMember.entity';
import { AddMemberDto } from './dto/add-member.dto';
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
        const bandExisting: Band | null = await this.bandsRepository.findOneBy({
            bandName: createBandDto.bandName
        })
        if (bandExisting) {
            throw new BadRequestException(`La banda ${createBandDto.bandName} ya existe.`)
        }

        //Buscamos los generos de la DB que coincidan con los recibidos
        const genres: Genre[] | null = await this.genresRepository.find({
            where: createBandDto.genres.map(name => ({ name })),
        });

        // Validar que existan todos
        if (genres.length !== createBandDto.genres.length) {
            throw new BadRequestException('Uno o más géneros no existen en la base de datos.');
        }

        // Crear al miembro nuevo (el lider)
        const leaderMember = this.memberRepository.create({
            user,
            entryDate: new Date(),
        });

        // Crear la banda
        const newBand: Band = this.bandsRepository.create({
            ...createBandDto,
            formationDate: new Date(createBandDto.formationDate),
            leader: user,
            genres,
            bandMembers: [leaderMember],
        })

        // Como la relacion tiene cascade: true guarda todo en una sola operacion
        await this.bandsRepository.save(newBand);

        // Transformar la respuesta para evitar datos sensibles
        const transformedBand = plainToInstance(BandResponseDto, newBand, {
            excludeExtraneousValues: true,
        })

        return transformedBand;
    }

    async update(id: string, updatebandDto: UpdateBandDto) {
        const bandExisting: Band | null = await this.bandsRepository.findOne({
            where: { id },
            relations: {
                leader: { roles: true, genres: true },
                genres: true,
                bandMembers: { band: true, user: true },
            }
        });
        if (!bandExisting) {
            throw new NotFoundException(`Banda con id ${id} no fue encontrada`);
        }

        if (updatebandDto.newGenres && updatebandDto.newGenres.length > 0) {
            const foundGenres: Genre[] | null = await this.genresRepository.find({
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

        await this.bandsRepository.save(bandExisting);

        const transformedBand = plainToInstance(BandResponseDto, bandExisting, {
            excludeExtraneousValues: true,
        })

        return transformedBand;
    }

    async findAll(page: number = Pages.Pages, limit: number = Pages.Limit) {
        const [bands, total] = await this.bandsRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            relations: {
                leader: { roles: true, genres: true },
                genres: true,
                bandMembers: { band: true, user: true },
            }
        });

        if (!bands) throw new NotFoundException('Bandas no encontrado');

        const transformedBands = plainToInstance(BandResponseDto, bands, {
            excludeExtraneousValues: true,
        });

        const meta = { total, page, limit };
        return { transformedBands, meta };
    }

    async findOne(id: string) {
        const bandExisting: Band | null = await this.bandsRepository.findOne({
            where: { id },
            relations: {
                leader: { roles: true, genres: true },
                genres: true,
                bandMembers: { band: true, user: true },
            }
        });

        if (!bandExisting) throw new NotFoundException('Banda no encontrada');

        const transformedBand = plainToInstance(BandResponseDto, bandExisting, {
            excludeExtraneousValues: true,
        })

        return transformedBand;
    }

    async updateProfilePicture(file: Express.Multer.File, bandId: string) {
        const band: Band | null = await this.bandsRepository.findOneBy({ id: bandId });

        if (!band) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return this.uploadImage(file, bandId);
    }

    async addOneMember(bandId: string, addMemberDto: AddMemberDto) {
        //Por ahora se agregarán miembors de la banda de a uno con este endpoint
        const band: Band | null = await this.bandsRepository.findOne({
            where: { id: bandId },
            relations: {
                bandMembers: { user: true, band: true }
            }
        })
        if (!band) {
            throw new NotFoundException(`Banda no encontrada`)
        }

        const user: User | null = await this.usersRepository.findOneBy({ userName: addMemberDto.userName })

        if (!user) throw new NotFoundException(`Usuario ${addMemberDto.userName} no encontrado`)

        const alreadyMember = band.bandMembers.some(
            (bandMember) => bandMember.user.id === user.id && !bandMember.departureDate,
        );

        if (alreadyMember) throw new BadRequestException(`El usuario ya es miembro activo de la banda.`);

        const newMember = this.memberRepository.create({
            band: { id: band.id },
            user: { id: user.id },
            entryDate: new Date(),
        })

        const savedMember: BandMember = await this.memberRepository.save(newMember)

        band.bandMembers.push(savedMember);

        await this.bandsRepository.save(band);

        const transformedBand = plainToInstance(BandResponseDto, band, {
            excludeExtraneousValues: true,
        })

        return transformedBand;
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
}