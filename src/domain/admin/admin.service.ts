import { Injectable, NotFoundException } from '@nestjs/common';
import { Pages } from 'src/common/enums/pages.enum';
import { EntityManager, EntityTarget, FindOneOptions, ObjectLiteral } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    private readonly entityManager: EntityManager,
  ) { }
  async findEntites<T extends ObjectLiteral>(
    entityClass: EntityTarget<T>,
    page: number = Pages.Pages,
    limit: number = Pages.Limit,
    withDeleted: boolean = false,
    options: FindOneOptions<T> = {}
  ) {
    const repository = this.entityManager.getRepository(entityClass);
    const skip = (page - 1) * limit;

    const [data, total] = await repository.findAndCount({
      ...options,
      skip,
      take: limit,
      withDeleted,
    });

    if (!data.length && !withDeleted) {
      throw new NotFoundException(`Entidad no encontrados.`)
    }

    return { meta: { total, page, limit }, data };
  }

  async softDeleteEntity<T extends ObjectLiteral>(
    entityClass: EntityTarget<T>,
    id: string,
  ) {
    const repository = this.entityManager.getRepository(entityClass);
    const result = await repository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`No se pudo realizar el borrado lógico de la entidad con ID ${id}.`);
    }
  }

  async hardDeleteEntity<T extends ObjectLiteral>(
    entityClass: EntityTarget<T>,
    id: string,
  ) {
    const repository = this.entityManager.getRepository(entityClass);
    const result = await repository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`No se pudo realizar el borrado fisico de la entidad con ID ${id}.`);
    }
  }
}
