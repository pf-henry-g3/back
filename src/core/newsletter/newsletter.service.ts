import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '../mailer/mailer.service';
import { UserService } from 'src/domain/user/user.service';
import { TransactionalEmailDto } from '../mailer/dto/transactional-mail.dto';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class NewsletterService {
    private readonly logger = new Logger(NewsletterService.name);

    constructor(
        private readonly mailerService: MailerService,
        private readonly userService: UserService,
    ) { }

    @Cron(CronExpression.EVERY_WEEK, { name: 'weeklyNewsletter', timeZone: 'America/Argentina/Buenos_Aires')
    async handleCron() {
        this.logger.log('Iniciando envio de novedades de la semana...');

        const allUsers = await this.userService.findAll();

        let sentCount = 0;

        for (const user of allUsers.transformedUsers) {
            const emailDto: TransactionalEmailDto = {
                to: user.email,
                name: user.name,
                pageTitle: 'Novedades de la Semana',
                mainTitle: '¡Lo más destacado en Syncro!',
                mainMessage: 'Aquí encontrarás un resumen de las bandas, eventos y vacantes más interesantes de la semana. ¡No te lo pierdas!',
                buttonText: 'Ver Novedades',
                actionUrl: `${process.env.FRONTEND_URL}/home`,
                appName: 'Syncro',
                year: new Date().getFullYear(),
                secondaryMessage: 'Si no deseas recibir estas novedades, puedes actualizar tus preferencias en tu perfil.',
            };

            try {
                await this.mailerService.sendTransactionalEmail(emailDto)
                sentCount++;
            } catch (error) {
                this.logger.error(`Fallo al enviar el correo a ${user.email}:`, error.message);
            }
        }
        this.logger.log(`Envío de newsletter finalizado. Total de correos enviados: ${sentCount}`);
    }
}
