import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { Pages } from 'src/common/enums/pages.enum';
import { EntityManager, EntityTarget, FindOneOptions, ObjectLiteral } from 'typeorm';
import { Role } from '../role/entities/role.entity';
import { plainToInstance } from 'class-transformer';
import { UserAdminResponseDto } from './dto/user-response-admin.dto';

interface HistoricalRelationConfig {
  entity: EntityTarget<any>;
  relationField: string;
  isManyToMany?: boolean;
}

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

  async findOneEntityByID<T extends ObjectLiteral>(
    entityClass: EntityTarget<T>,
    id: string,
    withDeleted: boolean = false,
    options: FindOneOptions<T> = {}
  ) {
    const repository = this.entityManager.getRepository(entityClass);

    try {
      const entity = await repository.findOneOrFail({
        ...options,
        where: { id } as any,
        withDeleted,
      });

      return entity;
    } catch (error) {
      throw new NotFoundException(`Entidad con ID ${id} no encontrado.`);
    }

  }

  async findHistoricalRelations<T extends ObjectLiteral>(
    config: HistoricalRelationConfig,
    parentEntityId: string,
    withDeleted: boolean = false,
    page: number = Pages.Pages,
    limit: number = Pages.Limit,
  ) {
    const { entity, relationField, isManyToMany } = config;
    const repository = this.entityManager.getRepository(entity);
    const skip = (page - 1) * limit;

    if (isManyToMany) {
      const qb = repository.createQueryBuilder('child')
        .innerJoinAndSelect(`child.${relationField}`, 'parent')
        .where('parent.id = :parentId', { parentId: parentEntityId })

        // 🟢 CLAVE: Añadir SELECT explícito para los campos básicos
        // Selecciona todos los campos de la entidad 'child'
        .select(['child', 'parent'])

        .skip(skip)
        .take(limit);

      if (withDeleted) {
        qb.withDeleted();
      }

      const [data, total] = await qb.getManyAndCount();
      return { meta: { total, page, limit }, data };
    }

    // 2. MANEJO DE RELACIONES ONE-TO-MANY (1:N) / FK Directo (Lógica Original)
    const [data, total] = await repository.findAndCount({
      where: {
        [relationField]: { id: parentEntityId }
      } as any,
      skip,
      take: limit,
      withDeleted,
    });

    return { meta: { total, page, limit }, data };
  }

  async newAdmin(id: string, rolName: string) {
    const usersRepository = this.entityManager.getRepository(User);
    const rolesRepository = this.entityManager.getRepository(Role);

    const foundRole: Role | null = await rolesRepository.findOne({
      where: ({ name: rolName })
    });

    if (!foundRole) throw new NotFoundException('El rol no es valido.');

    const user: User | null = await usersRepository.findOne({
      where: { id },
      relations: {
        roles: true,
      }
    });

    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const updatedRoles = [...user.roles, foundRole];
    user.roles = updatedRoles;

    await usersRepository.save(user);

    return plainToInstance(UserAdminResponseDto, user, {
      excludeExtraneousValues: true,
    })
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
