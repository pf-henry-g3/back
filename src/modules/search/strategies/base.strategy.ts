import { ObjectLiteral, Repository } from "typeorm";

export abstract class BaseSearchStrategy<T extends ObjectLiteral> {
    constructor(protected repository: Repository<T>) { }

    abstract getType(): string;
    abstract getTextFields(): string[];
    abstract getRelationName(): string | null;
    abstract getSelectFields(): (keyof T)[];
}