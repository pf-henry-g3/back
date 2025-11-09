import { ObjectLiteral, Repository } from 'typeorm';

export abstract class BaseSearchStrategy<T extends ObjectLiteral> {
    constructor(protected repository: Repository<T>) { }

    abstract getType(): string;
    abstract getTextFields(): string[];
    abstract getRelationName(): string | null;
    abstract getSelectFields(): (keyof T)[];

    async executeSearch(
        searchPattern: string,
        genreNames: string[],
        skip: number,
        limit: number,
        hasGenreFilter: boolean
    ): Promise<[Partial<T>[], number]> {
        const alias = this.getType().toLowerCase();
        const qb = this.repository.createQueryBuilder(alias);

        const textFields = this.getTextFields();
        const relation = this.getRelationName();
        const selectFields = this.getSelectFields();

        qb.select(selectFields.map(f => `${alias}.${String(f)}`));

        if (textFields.length > 0) {
            const conditions = textFields
                .map(field => `${alias}.${field} ILIKE :search`)
                .join(' OR ');
            qb.where(`(${conditions})`, { search: searchPattern });
        }

        if (hasGenreFilter && relation && genreNames.length > 0) {
            qb.leftJoin(`${alias}.${relation}`, relation)
                .andWhere(`${relation}.name ILIKE ANY(:genres)`, { genres: genreNames });
        }

        qb.skip(skip).take(limit);
        const [results, total] = await qb.getManyAndCount();
        return [results, total];
    }
}