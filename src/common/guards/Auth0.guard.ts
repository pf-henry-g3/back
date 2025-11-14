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

        try {
            const decodedToken = jwt.decode(token, { complete: true });
            if (!decodedToken) {
                throw new UnauthorizedException('Token inválido');
            }

            const key = await this.client.getSigningKey(decodedToken.header.kid);
            const signingKey = key.getPublicKey();

            const payload: any = jwt.verify(token, signingKey, {
                audience: process.env.AUTH0_AUDIENCE,
                issuer: `https://${process.env.AUTH0_DOMAIN}/`,
                algorithms: ['RS256'],
            });

            request['auth0User'] = payload;
            return true;

        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Token de Auth0 expirado.');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Token de Auth0 inválido.');
            }
            if (error.message?.includes('audience')) {
                throw new UnauthorizedException('Token de Auth0: audience no coincide. Verifica AUTH0_AUDIENCE.');
            }
            if (error.message?.includes('issuer')) {
                throw new UnauthorizedException('Token de Auth0: issuer no coincide. Verifica AUTH0_DOMAIN.');
            }
            throw new UnauthorizedException(`Token de Auth0 inválido o expirado: ${error.message || error}`);
        }

    }
}