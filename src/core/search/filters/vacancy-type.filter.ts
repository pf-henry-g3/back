import { ObjectLiteral } from "typeorm";
import { BaseFilter } from "./base.filter";
import { SelectQueryBuilder } from "typeorm/browser";

export class VacancyTypeFilter<T extends ObjectLiteral> implements BaseFilter<T> {
    name = 'vacancyType';

    apply(qb: SelectQueryBuilder<T>, alias: string, values: string[]) {
        if (!values || values.length === 0) return;

        const lowerValues = values.map(v => v.toLowerCase());

        qb.andWhere(`LOWER(${alias}.vacancyType) IN (:...vacancyTypes)`, {
            vacancyTypes: lowerValues
        });
    }
}