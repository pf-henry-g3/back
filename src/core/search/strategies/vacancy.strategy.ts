import { Repository } from "typeorm";
import { BaseSearchStrategy } from "./base.strategy";
import { Vacancy } from "src/domain/vacancy/entities/vacancy.entity";
import { BaseFilter } from "../filters/base.filter";
import { GlobalSearchResult } from "../dto/globalSearchResult.dto";

export class VacancySearchStrategy extends BaseSearchStrategy<Vacancy> {
    constructor(repo: Repository<Vacancy>) { super(repo); }

    getType(): string { return 'vacancy'; }
    getTextFields(): string[] { return ['name', 'vacancyDescription']; }
    getRelationName() { return 'genres'; }
    getSelectFields(): (keyof Vacancy)[] { return [] as any; }

    mapToDto(entity: Vacancy): GlobalSearchResult {
        // Obtenemos el ID del dueño (owner)
        const ownerId = entity.owner?.id;

        return {
            id: entity.id,
            type: 'vacancy',
            urlImage: entity.urlImage,

            // Mapeo de campos genéricos
            name: entity.name,
            description: entity.vacancyDescription,

            // Campos específicos de Vacancy
            ownerId: ownerId,
            isOpen: entity.isOpen,
            city: entity.city,
            country: entity.country,
        } as GlobalSearchResult;
    }

    async executeSearch(
        searchPattern: string,
        filtersInput: Record<string, any>,
        availableFilters: BaseFilter<Vacancy>[],
        skip: number,
        limit: number
    ): Promise<[GlobalSearchResult[], number]> {

        const qb = this.repository.createQueryBuilder('vacancy')
            .leftJoinAndSelect('vacancy.owner', 'owner');

        availableFilters.forEach(filter => {
            const value = filtersInput[filter.name];
            if (value) {
                filter.apply(qb, 'vacancy', value);
            }
        });

        const textWhere = this.getTextFields()
            .map(field => `"vacancy"."${field}" ILIKE :searchPattern`)
            .join(' OR ');

        qb.andWhere(`(${textWhere})`, { searchPattern })
            .skip(skip)
            .take(limit)
            .select([
                'vacancy.id',
                'vacancy.name',
                'vacancy.vacancyDescription',
                'vacancy.isOpen',
                'vacancy.urlImage',
                'vacancy.country',
                'vacancy.city',
                'vacancy.vacancyType',
                'owner.id',
                'owner.userName',
            ]);

        const [results, total] = await qb.getManyAndCount();

        const data = results.map(r => this.mapToDto(r));

        return [data, total];
    }
}