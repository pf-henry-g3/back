// src/common/strategies/user.strategy.ts (ACTUALIZADO)

import { BaseSearchStrategy } from './base.strategy';
import { User } from 'src/domain/user/entities/user.entity';
import { Repository } from 'typeorm';
import { GlobalSearchResult } from '../dto/globalSearchResult.dto';

export class UserSearchStrategy extends BaseSearchStrategy<User> {
    constructor(repo: Repository<User>) { super(repo); }

    getType() { return 'user'; }
    getTextFields() { return ['userName', 'aboutMe']; }
    getRelationName() { return 'genres'; }

    getSelectFields(): (keyof User)[] {
        return [
            'id',
            'userName',
            'urlImage',
            'aboutMe',
            'city',
            'country',
            'birthDate',
            'averageRating'
        ] as (keyof User)[];
    }

    mapToDto(entity: User): GlobalSearchResult {
        return {
            id: entity.id,
            type: 'user',
            urlImage: entity.urlImage,

            // Mapeo de campos genéricos
            name: entity.userName,
            description: entity.aboutMe,

            // Campos específicos de User
            birthDate: entity.birthDate,
            averageRating: entity.averageRating,
            city: entity.city,
            country: entity.country,

            // El resto de campos de Band/Vacancy quedan undefined
        } as GlobalSearchResult;
    }
}