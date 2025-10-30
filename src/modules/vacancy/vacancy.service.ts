import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import vacancysData from '../../data/vacancy.data.json';
import { InjectRepository } from '@nestjs/typeorm';
import { Vacancy } from './entities/vacancy.entity';
import { ILike, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import e from 'express';
import { Band } from '../band/entities/band.entity';
import { Pages } from 'src/enums/pages.enum';
import { FileUploadService } from '../file-upload/file-upload.service';
import { AbstractFileUploadService } from '../file-upload/file-upload.abstract.service';

@Injectable()
export class VacancyService extends AbstractFileUploadService<Vacancy> {
  constructor(
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Band)
    private readonly bandsRepository: Repository<Band>,

    fileUploadService: FileUploadService
  ) { super(fileUploadService, vacancyRepository) }


  create(createVacancyDto: CreateVacancyDto) {
    return 'This action adds a new vacancy';
  }

  async findAll(page: number = Pages.Pages, limit: number = Pages.Limit) {
    const [vacancies, total] = await this.vacancyRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        vacancyGenres: true
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

  async findAllByGenre(genreName: string, page: number = Pages.Pages, limit: number = Pages.Limit) {
    let genre = await this.vacancyRepository.findOne({
      where: {
        name: ILike(`%${genreName}%`)
      },
      relations: {
        vacancyGenres: true,
      }
    });

    if (!genre) throw new NotFoundException('Genero no encontrado');

    const [vacancies, total] = await this.usersRepository
      .createQueryBuilder('vacancy')
      .innerJoin('vacancy.genres', 'genre')
      .where('genre.id = :genreId', { genreId: genre.id })
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    if (!vacancies.length) throw new NotFoundException('No hay vacantes para este genero');

    return {
      total,
      page,
      limit,
      result: vacancies
    }
  }

  async findOne(id: string) {
    return await this.vacancyRepository.findOne({ where: { id: id } })
  }

  async updateProfilePicture(file: Express.Multer.File, vacancyId: string) {
    const vacancy = await this.vacancyRepository.findOneBy({ id: vacancyId });

    if (!vacancy) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.uploadImage(file, vacancyId);
  }

  update(id: number, updateVacancyDto: UpdateVacancyDto) {
    return `This action updates a #${id} vacancy`;
  }

  remove(id: number) {
    return `This action removes a #${id} vacancy`;
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
      newVacancy.ownerId = user;
      await this.vacancyRepository.save(newVacancy);
      console.log(`✅ Vacante ${vacancyData.name} creada.`);
    }
    console.log('🎉 Precarga de vacantes completada.');
  }
}
