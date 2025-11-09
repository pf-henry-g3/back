import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import genres from '../../data/genre.data.json'
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Like, Repository } from 'typeorm';
import { Genre } from './entities/genre.entity';
import { Pages } from 'src/common/enums/pages.enum';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) { }

  async seederGenres(): Promise<void> {
    for (const genre of genres) {
      const genreExists = await this.genreRepository.findOne({
        where: { name: genre.name },
      });

      if (!genreExists) {
        const newGenre = this.genreRepository.create({ name: genre.name });
        await this.genreRepository.save(newGenre);
        console.log(`🎶 Género "${genre.name}" creado.`);
      }
    }
  }


  async create(createGenreDto: CreateGenreDto) {
    const foundRole = await this.genreRepository.findOneBy({ name: createGenreDto.name });

    if (foundRole) throw new BadRequestException('El rol ya existe');

    const newGenre: Genre = this.genreRepository.create({ ...createGenreDto });

    await this.genreRepository.save(newGenre);

    return `Rol ${createGenreDto.name} creado con exito`;
  }

  async findAll(page: number = Pages.Pages, limit: number = Pages.Limit) {
    let [genres, total] = await this.genreRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        //users sin datos sensibles
        bands: true,
        vacancies: true,
      }
    });

    if (!genres) throw new NotFoundException("Generos no encontrados");

    return {
      data: genres,
      meta: {
        total,
        page,
        limit,
      }
    };
  }

  async findRolByName(genreName: string, page: number = Pages.Pages, limit: number = Pages.Limit) {
    const [genres, total] = await this.genreRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        name: ILike(`%${genreName}%`),
      },
      relations: {
        //users sin datos sensibles
      },
    })

    if (!genres) throw new NotFoundException("Generos no encontrados");

    return {
      data: genres,
      meta: {
        total,
        page,
        limit,
      }
    }
  }

  async remove(id: number) {
    return `This action removes a #${id} genre`;
  }
}
