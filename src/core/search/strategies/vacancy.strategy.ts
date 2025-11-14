import { Repository } from "typeorm";
import { BaseSearchStrategy } from "./base.strategy";
import { Vacancy } from "src/domain/vacancy/entities/vacancy.entity";

export class VacancySearchStrategy extends BaseSearchStrategy<Vacancy> {
    constructor(repo: Repository<Vacancy>) { super(repo); }

    getType(): string {
        return 'vacancy';
    }

    getTextFields(): string[] {
        return ['name', 'vacancyDescription'];
    }

    getRelationName() {
        return 'genres';
    }

    getSelectFields(): (keyof Vacancy)[] {
        return [
            'id',
            'name',
            'vacancyDescription',
            'isOpen',
            'urlImage',
            'owner',
        ] as (keyof Vacancy)[];
    }

    async executeSearch(
        searchPattern: string,
        genreNames: string[],
        skip: number,
        limit: number,
        hasGenreFilter: boolean
    ): Promise<[Vacancy[], number]> {
        const qb = this.repository.createQueryBuilder('vacancy')
            .leftJoinAndSelect('vacancy.owner', 'owner');  // <-- JOIN al dueño

        if (hasGenreFilter) {
            qb.innerJoin('vacancy.genres', 'genreRelation')
                .andWhere('LOWER(genreRelation.name) IN (:...genreNames)', { genreNames });
        }

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
                'owner.id',
                'owner.userName',
            ]);

        return qb.getManyAndCount();
    }
}
