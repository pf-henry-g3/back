// src/common/guards/Auth0.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import jwksClient, { JwksClient } from "jwks-rsa";
import jwt from "jsonwebtoken";


@Injectable()
export class Auth0Guard implements CanActivate {
    private client: JwksClient;

    constructor() {
        this.client = jwksClient({
            jwksUri: `${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
        });
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        console.log('🔧 Auth0Guard inicializado');
        console.log('🔧 AUTH0_DOMAIN:', process.env.AUTH0_DOMAIN);
        console.log('🔧 AUTH0_AUDIENCE:', process.env.AUTH0_AUDIENCE);

        const request: Request = context.switchToHttp().getRequest();

        console.log('\n=== 🔐 Auth0Guard Debug ===');
        console.log('📍 URL:', request.url);
        console.log('📨 Headers:', JSON.stringify(request.headers, null, 2));

        const authHeader = request.headers.authorization;

        if (!authHeader) {
            console.error('❌ No hay header Authorization');
            throw new UnauthorizedException('Token de autenticación no proporcionado.');
        }

        console.log('✅ Authorization header encontrado:', authHeader.substring(0, 50) + '...');

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7).trim()
            : authHeader.trim();

        console.log('🎟️ Token extraído (primeros 50 chars):', token.substring(0, 50) + '...');

        try {
            const decodedToken = jwt.decode(token, { complete: true });

            if (!decodedToken) {
                console.error('❌ No se pudo decodificar el token');
                throw new UnauthorizedException('Token inválido');
            }

            console.log('📋 Token decodificado:');
            console.log('  - Header:', JSON.stringify(decodedToken.header, null, 2));
            console.log('  - Payload:', JSON.stringify(decodedToken.payload, null, 2));

            // 2️⃣ Obtener la clave pública de Auth0
            console.log('🔑 Obteniendo clave pública de Auth0...');
            const key = await this.client.getSigningKey(decodedToken.header.kid);
            const signingKey = key.getPublicKey();
            console.log('✅ Clave pública obtenida');

            // 3️⃣ Verificar el token
            console.log('🔍 Verificando token con:');
            console.log('  - audience:', process.env.AUTH0_AUDIENCE);
            console.log('  - issuer:', `${process.env.AUTH0_DOMAIN}/`);

            const payload: any = jwt.verify(token, signingKey, {
                audience: process.env.AUTH0_AUDIENCE,
                issuer: `${process.env.AUTH0_DOMAIN}/`,
                algorithms: ['RS256'],
            });

            console.log('✅ Token verificado correctamente');
            console.log('👤 Payload del usuario:', JSON.stringify(payload, null, 2));

            // 4️⃣ Guardar el payload en el request
            request['auth0User'] = payload;

            console.log('=== ✅ Auth0Guard Passed ===\n');
            return true;

        } catch (error: any) {
            console.error('❌ Error en Auth0Guard:', error.name);
            console.error('❌ Mensaje:', error.message);

            if (error.name === 'TokenExpiredError') {
                console.error('⏰ El token expiró en:', error.expiredAt);
                throw new UnauthorizedException('Token de Auth0 expirado.');
            }

            if (error.name === 'JsonWebTokenError') {
                console.error('🚫 Error en la estructura del JWT');
                throw new UnauthorizedException('Token de Auth0 inválido.');
            }

            if (error.message?.includes('audience')) {
                console.error('🎯 Audience esperado:', process.env.AUTH0_AUDIENCE);
                console.error('🎯 Audience recibido:', error.claim);
                throw new UnauthorizedException('Token de Auth0: audience no coincide. Verifica AUTH0_AUDIENCE.');
            }

            if (error.message?.includes('issuer')) {
                console.error('🏢 Issuer esperado:', `https://${process.env.AUTH0_DOMAIN}/`);
                console.error('🏢 Issuer recibido:', error.claim);
                throw new UnauthorizedException('Token de Auth0: issuer no coincide. Verifica AUTH0_DOMAIN.');
            }

            console.error('❌ Error completo:', error);
            console.log('=== ❌ Auth0Guard Failed ===\n');
            throw new UnauthorizedException(`Token de Auth0 inválido o expirado: ${error.message || error}`);
        }
    }
}
