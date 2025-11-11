import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import jwksClient, { JwksClient } from "jwks-rsa";
import jwt from "jsonwebtoken";

@Injectable()
export class Auth0Guard implements CanActivate {
    private client: JwksClient;
    constructor() {
        this.client = jwksClient({
            jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
        });
    }


    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('Token de autenticación no proporcionado.');
        }

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7).trim()
            : authHeader.trim();

        console.log('🧠 TOKEN:', token.substring(0, 50) + '...');


        try {
            const decodedToken = jwt.decode(token, { complete: true });
            if (!decodedToken) {
                throw new UnauthorizedException('Token inválido');
            }

            // Obtener la clave pública de Auth0
            const key = await this.client.getSigningKey(decodedToken.header.kid);
            console.log('🔐 signingKey obtenido OK');
            const signingKey = key.getPublicKey();

            // Verificar el token con la clave pública
            const payload: any = jwt.verify(token, signingKey, {
                audience: process.env.AUTH0_AUDIENCE,
                issuer: `https://${process.env.AUTH0_DOMAIN}/`,
                algorithms: ['RS256'],
            });

            // Guardar payload de Auth0 en request
            request['auth0User'] = payload;
            console.log('✅ Token verificado correctamente');
            return true;

        } catch (error) {
            console.error('Error verificando token Auth0:', error);
            throw new UnauthorizedException('Token de Auth0 inválido o expirado.');
        }

    }
}