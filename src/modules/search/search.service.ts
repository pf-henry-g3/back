import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { Band } from '../band/entities/band.entity';
import { Vacancy } from '../vacancy/entities/vacancy.entity';
import { GlobalSearchResult } from './dto/globalSearchResult.dto';
import { Pages } from 'src/enums/pages.enum';

type SearchType = 'user' | 'band' | 'vacancy'; //tipos posibles segun DTO
const ALL_TYPES: SearchType[] = ['user', 'band', 'vacancy'];

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Band)
    private bandsRepository: Repository<Band>,

    @InjectRepository(Vacancy)
    private vacacniesRepository: Repository<Vacancy>,
  ) { }
  async globalSearch(
    query: string,
    typesFilter?: string,
    genresFilter?: string,
    page: number = Pages.Pages,
    limit: number = Pages.Limit) {


    // 1. Preparación de la búsqueda
    const searchPattern = `%${query}%`;
    const skip = (page - 1) * limit;

    // 2. Normalización de filtro de tipo de entidad
    let activeTypes: SearchType[];
    if (typesFilter) {
      const filterNames = typesFilter.toLowerCase().split(',').map(type => type.trim());
      activeTypes = filterNames.filter(name => ALL_TYPES.includes(name as SearchType)) as SearchType[];
    } else {
      activeTypes = ALL_TYPES; //Si no hay entidades en el filtro buscara en todas
    }

    // 3. Normalización de filtro de géneros
    let genreNames: string[] = [];
    let hasGenreFilter = false;

    if (genresFilter) {
      genreNames = genresFilter.toLowerCase().split(',').map(genre => genre.trim()).filter(g => g.length > 0);
      hasGenreFilter = genreNames.length > 0; //para evaluar si hay filtros de genero
    }

    // 4. Helper para construir la cláusula WHERE (solo usada si NO hay filtro de género)
    const buildSimpleWhereClause = (entityType: 'user' | 'band' | 'vacancy'): FindOptionsWhere<any>[] => {
      if (entityType === 'user') {
        return [
          { userName: ILike(searchPattern) },
          { aboutMe: ILike(searchPattern) }
        ] as FindOptionsWhere<User>[];
      }
      if (entityType === 'band') {
        return [
          { bandName: ILike(searchPattern) },
          { bandDescription: ILike(searchPattern) }
        ] as FindOptionsWhere<Band>[];
      }
      if (entityType === 'vacancy') {
        return [
          { name: ILike(searchPattern) },
          { vacancyDescription: ILike(searchPattern) }
        ] as FindOptionsWhere<Vacancy>[];
      }
      return [];
    }

    // 5. Función para ejecutar la consulta con el Query Builder (Usado solo si hasGenreFilter es true)
    const executeQueryBuilder = async <T extends User | Band | Vacancy>(
      repository: Repository<T>, //repositorio de tipo generico T
      entityAlias: string,
      textFields: string[], // Campos a buscar (e.g., ['userName', 'aboutMe'])
      relationName: string, // Nombre de la relación en la entidad (e.g., 'genres')
      selectFields: (keyof T)[], // Campos a seleccionar
    ): Promise<[T[], number]> => {
      const qb = repository.createQueryBuilder(entityAlias)
        //JOIN obligatorio para el filtro de género. Usamos INNER JOIN porque estamos consultando la relacion intermedia automatica M:N
        .innerJoin(`${entityAlias}.${relationName}`, 'genreRelation')
        //El filtro de género (AND) busca el nombre del genero de la tabla intermedia, en el filtro
        .andWhere('LOWER(genreRelation.name) IN (:...genreNames)', { genreNames });

      //El filtro de texto (OR) evalua los campos indicados
      const textWhere = textFields.map(field => `"${entityAlias}"."${field}" ILIKE :searchPattern`).join(' OR ');
      qb.andWhere(`(${textWhere})`, { searchPattern });

      // Aplicar paginación
      qb.skip(skip).take(limit);

      // Aplicar SELECT (TypeORM requiere mapear los campos si usamos Query Builder)
      // Seleccionamos los campos necesarios para el mapeo final
      qb.select(selectFields.map(field => `${entityAlias}.${String(field)}`));

      // Hacemos el COUNT y el GET
      const [results, total] = await qb.getManyAndCount();

      return [results as T[], total];
    }

    // 6. Crear promesas condicionales y ejecutarlas
    const promises: Promise<[any[], number]>[] = [] //array de promesas vacias :(
    let mappedUsers: GlobalSearchResult[] = [];
    let mappedBands: GlobalSearchResult[] = [];
    let mappedVacancies: GlobalSearchResult[] = [];

    let totalUsers = 0;
    let totalBands = 0;
    let totalVacancies = 0;

    // Configuración de campos a seleccionar para el mapeo de cada entidad
    const userSelects: (keyof User)[] = ['id', 'userName', 'urlImage', 'aboutMe', 'city', 'country', 'birthDate', 'averageRating'];
    const bandSelects: (keyof Band)[] = ['id', 'bandName', 'urlImage', 'bandDescription', 'formationDate', 'leader'];
    const vacancySelects: (keyof Vacancy)[] = ['id', 'name', 'urlImage', 'vacancyDescription', 'owner', 'isOpen'];

    // Construyo las promesas usando Query Builder si hay filtro de género
    // Se construyen las promesas, sin await no se ejecutan, solo se ejecutan en paralelo mas adelante
    if (activeTypes.includes('user')) {
      if (hasGenreFilter) {
        promises.push(
          executeQueryBuilder(
            this.usersRepository,    //repositorio a consultar
            'user',                  //tipo
            ['userName', 'aboutMe'], //campos a evaluar
            'genres',                //relaciones
            userSelects              //columnas a retornar
          )
        );
      } else {
        // Si NO hay filtro de género, usamos el método findAndCount original
        promises.push(
          this.usersRepository.findAndCount({ //este metodo no funciona si hay que consultar una tabla M:N por eso es necesario el anterior
            skip,
            take: limit,
            where: buildSimpleWhereClause('user') as FindOptionsWhere<User>[], //busqueda sin filtros de genero
            select: userSelects as any, // 'any' necesario por el tipo de `select`
          })
        );
      }
    }

    if (activeTypes.includes('band')) {
      if (hasGenreFilter) {
        promises.push(
          executeQueryBuilder(
            this.bandsRepository,
            'band',
            ['bandName', 'bandDescription'],
            'bandGenre',
            bandSelects
          )
        );
      } else {
        promises.push(
          this.bandsRepository.findAndCount({
            skip,
            take: limit,
            where: buildSimpleWhereClause('band') as FindOptionsWhere<Band>[],
            select: bandSelects as any,
          })
        );
      }
    }

    if (activeTypes.includes('vacancy')) {
      if (hasGenreFilter) {
        promises.push(
          executeQueryBuilder(
            this.vacacniesRepository,
            'vacancy',
            ['name', 'vacancyDescription'],
            'vacancyGenres',
            vacancySelects
          )
        );
      } else {
        promises.push(
          this.vacacniesRepository.findAndCount({
            skip,
            take: limit,
            where: buildSimpleWhereClause('vacancy') as FindOptionsWhere<Vacancy>[],
            select: vacancySelects as any,
          })
        );
      }
    }

    //Promise.all ejecuta todas las consultas en paralelo
    const resultsArrays = await Promise.all(promises);

    // 7. Mapeo de resultados
    let resultIndex = 0;

    if (activeTypes.includes('user')) {
      const [users, total] = resultsArrays[resultIndex++] as [User[], number];
      totalUsers = total;

      mappedUsers = users.map(user => ({
        id: user.id,
        name: user.userName,
        type: 'user',
        urlImage: user.urlImage,
        birthDate: user.birthDate,
        description: user.aboutMe,
        averageRating: user.averageRating,
        city: user.city,
        country: user.country,
      })) as GlobalSearchResult[];
    }

    if (activeTypes.includes('band')) {
      const [bands, total] = resultsArrays[resultIndex++] as [Band[], number];
      totalBands = total;

      mappedBands = bands.map(band => ({
        id: band.id,
        name: band.bandName,
        type: 'band',
        urlImage: band.urlImage,
        description: band.bandDescription,
        formationDate: band.formationDate,
        // Al usar Query Builder, las relaciones no se cargan por defecto, 
        // por lo que 'leader' puede ser undefined/null y se mantiene el '?'
        leaderId: (bands as Band[])[0].leader?.id,
      })) as GlobalSearchResult[];
    }

    if (activeTypes.includes('vacancy')) {
      const [vacancies, total] = resultsArrays[resultIndex++] as [Vacancy[], number];
      totalVacancies = total;

      mappedVacancies = vacancies.map(vacancy => ({
        id: vacancy.id,
        name: vacancy.name,
        type: 'vacancy',
        urlImage: vacancy.urlImage,
        description: vacancy.vacancyDescription,
        // Mantenemos el acceso opcional
        ownerId: (vacancies as Vacancy[])[0].owner?.id,
        isOpen: vacancy.isOpen
      })) as GlobalSearchResult[];
    }

    const total = totalUsers + totalBands + totalVacancies;

    return {
      meta: {
        total,
        page,
        limit,
      },
      data: [...mappedUsers, ...mappedBands, ...mappedVacancies],
    }
  }
}

