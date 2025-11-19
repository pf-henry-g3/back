import { ObjectLiteral, Repository } from 'typeorm';
import { BaseFilter } from '../filters/base.filter';
import { GlobalSearchResult } from '../dto/globalSearchResult.dto';

export abstract class BaseSearchStrategy<T extends ObjectLiteral> {
    constructor(protected repository: Repository<T>) { }

    abstract getType(): string;
    abstract getTextFields(): string[];
    abstract getRelationName(): string | null;
    abstract getSelectFields(): (keyof T)[];

    abstract mapToDto(entity: T): GlobalSearchResult;

    async executeSearch(
        searchPattern: string,
        filtersInput: Record<string, any>,
        availableFilters: BaseFilter<T>[],
        skip: number,
        limit: number,
    ): Promise<[GlobalSearchResult[], number]> {

        const alias = this.getType().toLowerCase();
        const qb = this.repository.createQueryBuilder(alias);

        const textFields = this.getTextFields();
        const selectFields = this.getSelectFields();

        qb.select(selectFields.map(f => `${alias}.${String(f)}`));

        if (textFields.length > 0) {
            const conditions = textFields
                .map(field => `${alias}.${field} ILIKE :search`)
                .join(' OR ');
            qb.where(`(${conditions})`, { search: searchPattern });
        }

        availableFilters.forEach(filter => {
            const value = filtersInput[filter.name];
            if (value) {
                filter.apply(qb, alias, value);
            }
        });

        qb.skip(skip).take(limit);
        const [results, total] = await qb.getManyAndCount();

        const data = results.map(r => this.mapToDto(r));

        return [data, total];
    }
}