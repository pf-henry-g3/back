import { MailerService } from "@nestjs-modules/mailer";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository, IsNull } from "typeorm";

@Injectable()
export class UserVerificationService {
    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService
    ) { }

    async verifyEmail(token: string) {
        try {
            const payload = this.jwtService.verify(token);

            const user = await this.usersRepository.findOne({
                where: { email: payload.email }
            })

            if (!user) throw new NotFoundException('Usuario no encontrado');

            user.isVerified = true;
            await this.usersRepository.save(user);

            return { message: 'Cuenta verificada correctamente' };

        } catch (error) {
            throw new BadRequestException('Token invalido o expirado');
        }
    }

    async sendEmail(email: string) {
        const user = await this.usersRepository.findOne({ where: { email } });

        if (!user) throw new NotFoundException('Usuario no encontrado');
        if (user.isVerified) throw new BadRequestException('El usuario ya está verificado');

        const payload = { email: user.email };
        const token = this.jwtService.sign(payload, { expiresIn: '1d' });

        const verifyLink = `${process.env.FRONTEND_URL}/user/verify?token=${token}`;

        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Verificá tu cuenta',
            template: 'verifyEmail', // sin extensión
            context: {
                appName: 'Syncro',
                name: user.name,
                verificationUrl: verifyLink,
                year: new Date().getFullYear(),
            },
        });
        return { message: 'Correo de verificación reenviado correctamente' };
    }

    async sendMassEmail(subject: string, body: string) {
        const users = await this.usersRepository.find({
            where: { deleteAt: IsNull() },
            select: ['email', 'name'],
        });

        if (users.length === 0) {
            throw new NotFoundException('No hay usuarios para enviar el email');
        }

        const results = {
            total: users.length,
            sent: 0,
            failed: 0,
            errors: [] as string[],
        };

        const escapeHtml = (text: string) => {
            const map: { [key: string]: string } = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;',
            };
            return text.replace(/[&<>"']/g, (m) => map[m]);
        };

        const safeSubject = escapeHtml(subject);
        const safeBody = escapeHtml(body).replace(/\n/g, '<br>');

        for (const user of users) {
            try {
                await this.mailerService.sendMail({
                    to: user.email,
                    subject: safeSubject,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #333; margin-bottom: 20px;">${safeSubject}</h2>
                            <div style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                ${safeBody}
                            </div>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="color: #999; font-size: 12px; margin-top: 20px;">
                                Este es un mensaje automático de Syncro. Por favor no respondas a este correo.
                            </p>
                        </div>
                    `,
                });
                results.sent++;
            } catch (error: any) {
                results.failed++;
                results.errors.push(`Error enviando a ${user.email}: ${error.message}`);
            }
        }

        return {
            message: `Emails enviados: ${results.sent} de ${results.total}`,
            total: results.total,
            sent: results.sent,
            failed: results.failed,
            errors: results.errors,
        };
    }
}
