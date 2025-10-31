export type SearchEntitytype = 'user' | 'band' | 'vacancy'

export interface GlobalSearchResult {
    id: string;
    name: string;
    type: SearchEntitytype;
    urlImage?: string;
    description?: string;
    //user
    birthDate?: Date;
    averageRating?: number;
    city?: string;
    country?: string;
    //vacancy
    requireEntityType?: 'Artist';
    ownerId?: string;
    isOpen?: boolean;
    //band
    leaderId?: string;
    formationDate?: Date;
}