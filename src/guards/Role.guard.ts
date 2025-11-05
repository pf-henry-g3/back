import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Role } from "src/modules/role/entities/role.entity";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector
    ) { }

    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.roles) {
            throw new ForbiddenException('Usuario sin roles o no autenticado');
        }

        // Extrae los nombres de los roles del usuario
        const userRoleNames = user.roles.map((role) => role.name);

        const hasRole = requiredRoles.some((role) => userRoleNames.includes(role));

        if (!hasRole) {
            throw new ForbiddenException('Forbidden Resource');
        }

        return true;
    }
}