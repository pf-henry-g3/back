import { Injectable } from "@nestjs/common";
import { TransactionalEmailDto } from "./dto/transactional-mail.dto";
import { MailerService as LibraryMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
    constructor(
        private readonly libraryMailer: LibraryMailerService,
    ) { }

    async sendTransactionalEmail(transactionalEmailDto: TransactionalEmailDto) {
        try {
            await this.libraryMailer.sendMail({
                to: transactionalEmailDto.to,
                subject: transactionalEmailDto.pageTitle,
                template: 'transactionalEmail',
                context: {
                    ...transactionalEmailDto,
                }
            });

            console.log(`Correo transaccional enviado a: ${transactionalEmailDto.to} - Asunto: ${transactionalEmailDto.pageTitle}`);

        } catch (error) {
            console.error('Error al enviar correo transaccional:', error);
            throw new Error(`Fallo el envío del correo: ${error.message}`);
        }
    }
}