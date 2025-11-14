import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Response } from "express";
import { Observable, tap } from "rxjs";
import { cookieConfig } from "src/config/cookie.config";

@Injectable()
export class SetAuthCookieInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const res = ctx.getResponse<Response>();

        return next.handle().pipe(
            tap(response => {
                const token = response?.data?.access_token;

                if (token) {
                    res.cookie('access_token', token, cookieConfig);
                    delete response.data.access_token; // opcional
                }
            })
        );
    }
}
