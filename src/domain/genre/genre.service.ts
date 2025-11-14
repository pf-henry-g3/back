import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import genres from '../../data/genre.data.json'
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Genre } from './entities/genre.entity';
import { Pages } from 'src/common/enums/pages.enum';
import { plainToInstance } from 'class-transformer';
import { GenreResponseDto } from 'src/common/dto/genre-response.dto';

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
    const foundGenre: Genre | null = await this.genreRepository.findOne({
      where: {
        name: ILike(`%${createGenreDto.name}%`),
      }
    });

    if (foundGenre) throw new BadRequestException('El genero ya existe');

    const newGenre: Genre = this.genreRepository.create({ ...createGenreDto });

    await this.genreRepository.save(newGenre);

    const transformedGenre = plainToInstance(GenreResponseDto, newGenre, {
      excludeExtraneousValues: true,
    })

    return transformedGenre;
  }

  async findAll(page: number = Pages.Pages, limit: number = Pages.Limit) {
    let [genres, total] = await this.genreRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    if (!genres) throw new NotFoundException("Generos no encontrados");

    const transformedGenres = plainToInstance(GenreResponseDto, genres, {
      excludeExtraneousValues: true,
    })

    const meta = { total, page, limit };
    return { transformedGenres, meta }
  };

  async findGenreByName(genreName: string, page: number = Pages.Pages, limit: number = Pages.Limit) {
    const [genres, total] = await this.genreRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        name: ILike(`%${genreName}%`),
      },
    })

    if (!genres) throw new NotFoundException("Generos no encontrados");

    const transformedGenres = plainToInstance(GenreResponseDto, genres, {
      excludeExtraneousValues: true,
    })

    const meta = { total, page, limit };

    return { transformedGenres, meta }
  }

  async softDelete(id: string) {
    const foundGenre: Genre | null = await this.genreRepository.findOneBy({ id });

    if (!foundGenre) throw new NotFoundException("Genero no encontrado");

    return await this.genreRepository.softDelete(id);
  }
}
