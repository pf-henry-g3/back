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
}
