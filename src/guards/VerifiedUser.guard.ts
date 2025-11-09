import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";
import { User } from "src/modules/user/entities/user.entity";

@Injectable()
export class VerifiedUserGuard implements CanActivate {
    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user as User;

        if (!user) throw new ForbiddenException('Usuario no autenticado');

        if (!user.isVerified) throw new ForbiddenException('Usuario sin correo verificado')

        return true;
    }

}