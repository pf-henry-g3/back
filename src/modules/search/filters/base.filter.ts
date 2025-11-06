
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export interface BaseFilter<T extends ObjectLiteral> {
    name: string;
    apply(qb: SelectQueryBuilder<T>, alias: string, value: any): void;
}
