import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";
import { Role } from "src/enums/roles.enum";
import { User } from "src/modules/user/entities/user.entity";

@Injectable()
export class SelfIdOrAdminGuard implements CanActivate {
    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request: Request = context.switchToHttp().getRequest();
        const user = request.user as User;
        const targetId = request.params.id;

        if (!user) throw new ForbiddenException('Usuario no autenticado');

        const userRoles = user.roles.map((role) => role.name);
        const isAdmin = userRoles.includes(Role.Admin) || userRoles.includes(Role.SuperAdmin);

        const isItself = user.id === targetId;

        if (!isAdmin && !isItself) throw new ForbiddenException('No tiene permisos para realizar esta accion');

        return true;
    }

}