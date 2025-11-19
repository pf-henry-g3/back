import { Band } from "src/domain/band/entities/band.entity";
import { BaseSearchStrategy } from "./base.strategy";
import { Repository, SelectQueryBuilder } from "typeorm";
import { BaseFilter } from "../filters/base.filter"; // Importamos BaseFilter
import { GlobalSearchResult } from "../dto/globalSearchResult.dto";
import { User } from "src/domain/user/entities/user.entity";

export class BandSearchStrategy extends BaseSearchStrategy<Band> {
    constructor(repo: Repository<Band>) { super(repo); }

    getType(): string { return 'band'; }
    getTextFields(): string[] { return ['bandName', 'bandDescription']; }
    getRelationName() { return 'genres'; }
    getSelectFields(): (keyof Band)[] { return [] as any; }

    mapToDto(entity: Band): GlobalSearchResult {
        // Necesitas asegurarte de que la relación 'leader' esté cargada para obtener leader.id
        const leader = entity.leader as User;

        return {
            id: entity.id,
            type: 'band',
            urlImage: entity.urlImage,

            // Mapeo de campos genéricos
            name: entity.bandName,
            description: entity.bandDescription,

            // Campos específicos de Band
            formationDate: entity.formationDate,
            averageRating: entity.averageRating,
            city: entity.city,
            country: entity.country,
            leaderId: leader ? leader.id : undefined, // Asumiendo que has hecho el JOIN

            // El resto de campos de User/Vacancy quedan undefined
        } as GlobalSearchResult;
    }

    async executeSearch(
        searchPattern: string,
        filtersInput: Record<string, any>, // Input del usuario
        availableFilters: BaseFilter<Band>[], // Filtros que se deben aplicar
        skip: number,
        limit: number
    ): Promise<[GlobalSearchResult[], number]> {

        const alias = this.getType().toLowerCase(); // 'band'
        const qb = this.repository.createQueryBuilder(alias)
            .leftJoinAndSelect('band.leader', 'leader');

        // --- 1. APLICACIÓN DINÁMICA DE FILTROS ---
        // Recorremos los filtros disponibles y los aplicamos
        availableFilters.forEach(filter => {
            const value = filtersInput[filter.name];
            if (value) {
                filter.apply(qb, alias, value);
            }
        });

        // --- 2. LÓGICA DE BÚSQUEDA DE TEXTO ---
        const textWhere = this.getTextFields()
            .map(field => `"${alias}"."${field}" ILIKE :searchPattern`)
            .join(' OR ');

        // Aplicamos la búsqueda de texto
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
                'leader.id',
                'leader.userName'
            ]);

        const [results, total] = await qb.getManyAndCount();

        const data = results.map(r => this.mapToDto(r));

        return [data, total];
    }
}