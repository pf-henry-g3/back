// src/app.controller.ts
import { Controller, Get, Req } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    getRoot(@Req() req) {
        if (req.oidc?.isAuthenticated()) {
            return {
                message: 'Bienvenido 🎉',
                user: req.oidc.user,
            };
        } else {
            return { message: 'No estás logueado' };
        }
    }
}
