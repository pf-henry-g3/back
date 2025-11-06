import { BaseFilter } from './base.filter';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export class GenreFilter<T extends ObjectLiteral> implements BaseFilter<T> {
    name = 'genre';
    apply(qb: SelectQueryBuilder<T>, alias: string, genreNames: string[]) {
        qb.innerJoin(`${alias}.genres`, 'genreRelation')
            .andWhere('LOWER(genreRelation.name) IN (:...genreNames)', { genreNames });
    }
}