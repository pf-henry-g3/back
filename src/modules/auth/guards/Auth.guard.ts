import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Observable } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request: Request = context.switchToHttp().getRequest();

        const authHeader = request.headers.authorization;

        if (!authHeader) return false;

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7).trim()
            : authHeader.trim();

        const secret = process.env.JWT_SECRET;

        try {
            const user = this.jwtService.verify(token, { secret });

            request['user'] = user;

            user.iat = new Date(user.iat * 1000).toLocaleString();
            user.exp = new Date(user.exp * 1000).toLocaleString();
            console.log(user);

        } catch (error) {
            console.log(error);

            return false;
        }

        return true;
    }

}