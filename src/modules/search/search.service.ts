import { Injectable } from '@nestjs/common';
import { UserSearchStrategy } from './strategies/user.strategy';
import { BandSearchStrategy } from './strategies/band.strategy';
import { VacancySearchStrategy } from './strategies/vacancy.strategy';
import { GenreFilter } from './filters/genre.filter';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Band } from '../band/entities/band.entity';
import { Vacancy } from '../vacancy/entities/vacancy.entity';
import { Pages } from 'src/enums/pages.enum';

@Injectable()
export class SearchService {
  private strategies: Record<string, any>;
  private filters: Record<string, any>;

  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Band) private bandsRepo: Repository<Band>,
    @InjectRepository(Vacancy) private vacanciesRepo: Repository<Vacancy>,
  ) {
    this.strategies = {
      user: new UserSearchStrategy(this.usersRepo),
      band: new BandSearchStrategy(this.bandsRepo),
      vacancy: new VacancySearchStrategy(this.vacanciesRepo),
    };

    this.filters = {
      genre: new GenreFilter(),
      // en el futuro → country, instrument, status, etc.
    };
  }

  async globalSearch(
    query: string,
    filters: Record<string, any>,
    types?: string[],
    page = Pages.Pages,
    limit = Pages.Limit
  ) {
    const activeTypes = types?.length ? types : Object.keys(this.strategies);
    const searchPattern = `%${query}%`;
    const skip = (page - 1) * limit;

    const results = await Promise.all(
      activeTypes.map(async type => {
        const strategy = this.strategies[type];
        if (!strategy) return [[], 0];

        const hasGenreFilter = filters?.genre?.length > 0;
        const genreNames = filters?.genre?.map((g: string) => g.toLowerCase()) || [];

        // usar el método específico de cada strategy
        return strategy.executeSearch(
          searchPattern,
          genreNames,
          skip,
          limit,
          hasGenreFilter
        );
      })
    );

    const total = results.reduce((acc, [, t]) => acc + t, 0);
    const data = results.flatMap(([r]) => r);

    return { meta: { total, page, limit }, data };
  }
}