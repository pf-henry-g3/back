import { Injectable } from '@nestjs/common';
import { UserSearchStrategy } from './strategies/user.strategy';
import { BandSearchStrategy } from './strategies/band.strategy';
import { VacancySearchStrategy } from './strategies/vacancy.strategy';
import { GenreFilter } from './filters/genre.filter';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/domain/user/entities/user.entity';
import { Band } from 'src/domain/band/entities/band.entity';
import { Vacancy } from 'src/domain/vacancy/entities/vacancy.entity';
import { Pages } from 'src/common/enums/pages.enum';
import { VacancyTypeFilter } from './filters/vacancy-type.filter';
import { BaseFilter } from './filters/base.filter';

@Injectable()
export class SearchService {
  private strategies: Record<string, any>;
  private globalFilters: Record<string, any>;

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

    // Instanciamos los filtros aquí
    this.globalFilters = {
      genre: new GenreFilter(),
      vacancyType: new VacancyTypeFilter(),
    };
  }

  async globalSearch(
    query: string,
    filtersInput: Record<string, any>,
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

        // DEFINIMOS QUÉ FILTROS APLICAN A QUÉ ESTRATEGIA
        // Esto te da control total. Por ejemplo, 'vacancyType' solo aplica a 'vacancy'.
        let applicableFilters: BaseFilter<any>[] = [];

        if (type === 'vacancy') {
          applicableFilters = [this.globalFilters.genre, this.globalFilters.vacancyType];
        } else if (type === 'band') {
          applicableFilters = [this.globalFilters.genre];
        } else {
          applicableFilters = [this.globalFilters.genre];
        }

        return strategy.executeSearch(
          searchPattern,
          filtersInput,      // Pasamos todos los valores de los filtros
          applicableFilters, // Pasamos las instancias de filtros válidos para esta entidad
          skip,
          limit
        );
      })
    );

    const total = results.reduce((acc, [, t]) => acc + t, 0);
    const data = results.flatMap(([r]) => r);

    return { meta: { total, page, limit }, data };
  }
}