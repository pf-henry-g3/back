// src/modules/auth/guards/auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { UserService } from "src/domain/user/user.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UserService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();

        let token: string | undefined;

        token = request.cookies?.access_token;

        if (!token) {
            const authHeader = request.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.slice(7).trim();
            }
        }

        // 3️⃣ Si no hay token en ninguno de los dos lados
        if (!token) {
            throw new UnauthorizedException('Token de autenticación no proporcionado.');
        }

        try {
            // 4️⃣ Verificar el token
            const { sub: userId } = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET
            });

            // 5️⃣ Buscar usuario en DB
            const userWithRoles = await this.usersService.findOne(userId, {
                relations: ['roles']
            });

            if (!userWithRoles) {
                throw new UnauthorizedException('Usuario no encontrado o token inválido.');
            }

            // 6️⃣ Agregar usuario al request
            request['user'] = userWithRoles;
            return true;

        } catch (error) {
            console.log('Error verificando token:', error.message);
            throw new UnauthorizedException('Token inválido o expirado.');
        }
    }
}