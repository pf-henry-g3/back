import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { MailerService } from "src/core/mailer/mailer.service";
import { TransactionalEmailDto } from "src/core/mailer/dto/transactional-mail.dto";

@Injectable()
export class UserVerificationService {
    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService,
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

        const verifyLink = `${process.env.FRONTEND_URL}/verified?token=${token}`;

        const emailDto: TransactionalEmailDto = {
            to: user.email,
            name: user.name,
            pageTitle: 'Verificá tu cuenta',
            mainTitle: '¡Cuenta creada!',
            mainMessage: 'Gracias por registrarte en Syncro. Antes de comenzar, necesitamos que verifiques tu cuenta para garantizar la seguridad de tu información.',
            buttonText: 'Verificar mi cuenta',
            actionUrl: verifyLink,

            appName: 'Syncro',
            year: new Date().getFullYear(),
            secondaryMessage: 'Si no creaste esta cuenta, podés ignorar este correo.'
        };

        await this.mailerService.sendTransactionalEmail(emailDto);

        return { message: 'Correo de verificación enviado correctamente' };
    }
}
