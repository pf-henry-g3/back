import { BaseSearchStrategy } from './base.strategy';
import { User } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';

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
}