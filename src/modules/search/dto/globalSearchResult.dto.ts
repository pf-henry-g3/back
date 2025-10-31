export type SearchEntitytype = 'user' | 'band' | 'vacancy'

export interface GlobalSearchResult {
    id: string;
    name: string;
    type: SearchEntitytype;
    description?: string;
    urlImage?: string;
    city?: string;
    country?: string;
    isOpen?: boolean;
}