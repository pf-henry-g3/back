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

        console.log('=== AuthGuard Debug ===');
        console.log('📍 URL:', request.url);
        console.log('🍪 Cookies:', request.cookies);  // 👈 Ver todas las cookies

        let token: string | undefined;

        // 1️⃣ Intentar obtener de la cookie
        token = request.cookies?.access_token;

        if (token) {
            console.log('✅ Token encontrado en cookie');
        } else {
            console.log('❌ No hay token en cookie');
        }

        // 2️⃣ Fallback: buscar en Authorization header
        if (!token) {
            const authHeader = request.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.slice(7).trim();
                console.log('✅ Token encontrado en header Authorization');
            }
        }

        // 3️⃣ Si no hay token en ninguno de los dos lados
        if (!token) {
            console.error('❌ No se encontró token en ningún lado');
            throw new UnauthorizedException('Token de autenticación no proporcionado.');
        }

        try {
            // 4️⃣ Verificar el token
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET
            });

            console.log('✅ Token válido, userId:', payload.sub);

            // 5️⃣ Buscar usuario en DB
            const userWithRoles = await this.usersService.findOne(payload.sub, {
                relations: ['roles']
            });

            if (!userWithRoles) {
                console.error('❌ Usuario no encontrado en DB:', payload.sub);
                throw new UnauthorizedException('Usuario no encontrado o token inválido.');
            }

            console.log('✅ Usuario encontrado:', userWithRoles.email);

            // 6️⃣ Agregar usuario al request
            request['user'] = userWithRoles;
            console.log('======================');
            return true;

        } catch (error) {
            console.error('❌ Error verificando token:', error.message);
            console.log('======================');
            throw new UnauthorizedException('Token inválido o expirado.');
        }
    }
}