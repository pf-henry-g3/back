import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Response } from "express";
import { Observable, tap } from "rxjs";
import { cookieConfig } from "src/config/cookie.config";

@Injectable()
export class SetAuthCookieInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const res = ctx.getResponse<Response>();
        console.log('🎇 Entra al interceptor de auth');


        return next.handle().pipe(
            tap(response => {
                const token = response?.data?.access_token;

                if (token) {
                    console.log('=== Enviando Cookie desde el interceptor ===');
                    console.log('🔑 Token:', token ? 'Generado' : 'FALTA');
                    console.log('⚙️ Config:', cookieConfig);

                    res.cookie('access_token', token, cookieConfig);

                    console.log('✅ Cookie enviada');
                    console.log('=======================');

                    delete response.data.access_token; // opcional
                }
            })
        );
    }
}
