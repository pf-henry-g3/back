import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Observable } from "rxjs";
import { UserService } from "src/modules/user/user.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UserService

    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();

        const authHeader = request.headers.authorization;

        if (!authHeader) throw new UnauthorizedException('Token de autenticación no proporcionado.');

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7).trim()
            : authHeader.trim();

        const secret = process.env.JWT_SECRET;

        try {
            const { sub: userId } = this.jwtService.verify(token, { secret });

            const userWithRoles = await this.usersService.findOne(userId, { relations: ['roles'] });

            if (!userWithRoles) throw new UnauthorizedException('Usuario no encontrado o token inválido.');

            request['user'] = userWithRoles;

        } catch (error) {
            console.log(error);
            throw new UnauthorizedException('Token inválido o expirado.');
        }

        return true;
    }
}