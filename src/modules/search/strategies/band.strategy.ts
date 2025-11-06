import { Band } from "src/modules/band/entities/band.entity";
import { BaseSearchStrategy } from "./base.strategy";
import { Repository } from "typeorm";

export class BandSearchStrategy extends BaseSearchStrategy<Band> {
    constructor(repo: Repository<Band>) { super(repo); }

    getType(): string {
        return 'band';
    }
    getTextFields(): string[] {
        return ['bandName', 'bandDescription'];
    }
    getRelationName() {
        return 'genres';
    }
    getSelectFields(): (keyof Band)[] {
        return [
            'id',
            'bandName',
            'urlImage',
            'bandDescription',
            'formationDate',
            'leader',
            'city',
            'country',
            'averageRating'
        ] as (keyof Band)[];
    }

    async executeSearch(
        searchPattern: string,
        genreNames: string[],
        skip: number,
        limit: number,
        hasGenreFilter: boolean
    ): Promise<[Band[], number]> {
        const qb = this.repository.createQueryBuilder('band')
            .leftJoinAndSelect('band.leader', 'leader')  // <-- JOIN al líder

        if (hasGenreFilter) {
            qb.innerJoin('band.genres', 'genreRelation')
                .andWhere('LOWER(genreRelation.name) IN (:...genreNames)', { genreNames });
        }

        const textWhere = this.getTextFields()
            .map(field => `"band"."${field}" ILIKE :searchPattern`)
            .join(' OR ');

        qb.andWhere(`(${textWhere})`, { searchPattern })
            .skip(skip)
            .take(limit)
            .select([
                'band.id',
                'band.bandName',
                'band.urlImage',
                'band.bandDescription',
                'band.formationDate',
                'band.city',
                'band.country',
                'band.averageRating',
                'leader.id',          // selecciona solo lo que se necesita del líder
                'leader.userName'
            ]);

        return qb.getManyAndCount();
    }
}
