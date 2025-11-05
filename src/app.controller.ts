// src/app.controller.ts
import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './modules/auth/auth.service';

@Controller()
export class AppController {
    constructor(private readonly authService: AuthService) { }

    @Get()
    async getRoot(@Req() req, @Res() res: Response) {
        if (req.oidc?.isAuthenticated()) {
            await this.authService.syncAuth0User(req.oidc.user);

            // Luego podés redirigir al front o devolver datos
            return res.json({
                message: 'Bienvenido 🎉',
                user: req.oidc.user,
            });
        } else {
            return res.json({ message: 'No estás logueado' });
        }
    }

    @Get()
    async callback() {
        return this.authService.callback();
    }
}
