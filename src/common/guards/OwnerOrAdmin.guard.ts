// src/common/guards/owner-or-admin.guard.ts

import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    Scope,
    Type,
    mixin,
} from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/enums/roles.enum';
import { User } from 'src/domain/user/entities/user.entity';

/**
 * Crea un guard dinámico que verifica si el usuario autenticado
 * es propietario de una entidad (por clave relacional) o tiene rol admin.
 */
export function OwnerOrAdminGuard<T extends ObjectLiteral>(
    entity: Type<T>,
    relationKey: keyof T
): Type<CanActivate> {
    @Injectable({ scope: Scope.REQUEST })
    class MixinGuard implements CanActivate {
        constructor(
            @InjectRepository(entity)
            private readonly repository: Repository<T>,
        ) { }

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const request = context.switchToHttp().getRequest();
            const user = request.user as User;

            if (!user) throw new ForbiddenException('Usuario no autenticado');

            const entityId = request.params.id;

            const entityRecord = await this.repository.findOne({
                where: { id: entityId } as any,
                relations: [relationKey as string],
            });

            if (!entityRecord)
                throw new ForbiddenException('Entidad no encontrada');

            const owner = (entityRecord as any)[relationKey];
            if (!owner)
                throw new ForbiddenException('Entidad sin propietario definido');

            const roles = user.roles.map(r => r.name);
            const isAdmin =
                roles.includes(Role.Admin) || roles.includes(Role.SuperAdmin);
            const isOwner = owner.id === user.id;

            if (!isAdmin && !isOwner)
                throw new ForbiddenException('No tiene permisos sobre esta entidad');

            return true;
        }
    }

    return mixin(MixinGuard);
}
