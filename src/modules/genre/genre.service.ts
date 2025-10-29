import { Injectable } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import genres from '../../data/genre.data.json'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from './entities/genre.entity';

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


  create(createGenreDto: CreateGenreDto) {
    return 'This action adds a new genre';
  }

  findAll() {
    return `This action returns all genre`;
  }

  findOne(id: number) {
    return `This action returns a #${id} genre`;
  }

  update(id: number, updateGenreDto: UpdateGenreDto) {
    return `This action updates a #${id} genre`;
  }

  remove(id: number) {
    return `This action removes a #${id} genre`;
  }
}
