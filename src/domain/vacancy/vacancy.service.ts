import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import vacancysData from '../../data/vacancy.data.json';
import { InjectRepository } from '@nestjs/typeorm';
import { Vacancy } from './entities/vacancy.entity';
import { ILike, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Pages } from 'src/common/enums/pages.enum';
import { FileUploadService } from '../../core/file-upload/file-upload.service';
import { AbstractFileUploadService } from '../../core/file-upload/file-upload.abstract.service';
import { Genre } from '../genre/entities/genre.entity';

@Injectable()
export class VacancyService extends AbstractFileUploadService<Vacancy> {
  constructor(
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Genre)
    private readonly genresRepository: Repository<Genre>,

    fileUploadService: FileUploadService
  ) { super(fileUploadService, vacancyRepository) }


  async create(createVacancyDto: CreateVacancyDto, user: User) {
    //Buscamos los generos de la DB que coincidan con los recibidos

    const genres = await this.genresRepository.find({
      where: createVacancyDto.genres.map(name => ({ name })),
    });

    // Validar que existan todos
    if (genres.length !== createVacancyDto.genres.length) {
      throw new BadRequestException('Uno o más géneros no existen en la base de datos.');
    }

    //Crear la nueva vacante
    const newVacancy = this.vacancyRepository.create({
      ...createVacancyDto,
      owner: { id: user.id },
      genres,
    })

    return await this.vacancyRepository.save(newVacancy);
  }

  async findAll(page: number = Pages.Pages, limit: number = Pages.Limit) {
    const [vacancies, total] = await this.vacancyRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        genres: true
      }
    });

    if (!vacancies) throw new NotFoundException("Vacantes no encontrados");

    return {
      meta: {
        total,
        page,
        limit,
      },
      data: vacancies,
    };
  }

  async findOne(id: string) {
    let foundVacancy = await this.vacancyRepository.findOne({
      where: { id: id },
      relations: {
        owner: true,
        genres: true,
      }
    });

    if (!foundVacancy) throw new BadRequestException('Vacante no encontrada')

    const owner = await this.usersRepository.findOne({
      where: { id: foundVacancy?.owner.id },
      select: ['id', 'userName', 'name', 'email', 'aboutMe', 'averageRating', 'country', 'city']
    })

    if (!owner) throw new BadRequestException('Usuario no encontrada')

    foundVacancy.owner = owner;

    return { message: 'Vacante encontrada', foundVacancy };
  }

  async updateProfilePicture(file: Express.Multer.File, vacancyId: string) {
    const vacancy = await this.vacancyRepository.findOneBy({ id: vacancyId });

    if (!vacancy) {
      throw new NotFoundException('Vacante no encontrado');
    }

    return this.uploadImage(file, vacancyId);
  }

  update(id: number, updateVacancyDto: UpdateVacancyDto) {
    return `This action updates a #${id} vacancy`;
  }

  async remove(id: number) {
    return await this.vacancyRepository.softDelete(id)
  }

  async seederVacancies(): Promise<void> {
    console.log('⏳ Precargando vacantes...');
    for (const vacancyData of vacancysData) {
      const existingVacancy = await this.vacancyRepository.findOne({
        where: { name: vacancyData.name }
      });
      if (existingVacancy) {
        console.log(`⚠️ Vacante ${vacancyData.name} ya existe, saltando...`);
        continue;
      }
      const user = await this.usersRepository.findOne({
        where: { userName: vacancyData.vacancyuserName }
      });
      if (!user) {
        console.log(`⚠️ Usuario con nombre ${vacancyData.vacancyuserName} no encontrado, saltando vacante ${vacancyData.name}...`);
        continue;
      }

      const newVacancy = this.vacancyRepository.create(vacancyData);
      newVacancy.owner = user;
      await this.vacancyRepository.save(newVacancy);
      console.log(`✅ Vacante ${vacancyData.name} creada.`);
    }
    console.log('🎉 Precarga de vacantes completada.');
  }
}
