// mailer.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailerService {
    private transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT), // ← asegúrate de convertirlo a número
        secure: false, // ← cambia a true si usas puerto 465 (SSL)
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    async sendMail(options: {
        to: string;
        subject: string;
        template: string;
        context?: Record<string, any>;
    }) {
        const { to, subject, template, context = {} } = options;

        try {
            // Ruta absoluta del template
            const templatePath = path.resolve(__dirname, '..', 'templates', `${template}.hbs`);
            if (!fs.existsSync(templatePath)) {
                throw new Error(`No se encontró el template: ${templatePath}`);
            }

            // Leer y compilar el template con Handlebars
            const templateSource = fs.readFileSync(templatePath, 'utf8');
            const compiledTemplate = handlebars.compile(templateSource);
            const html = compiledTemplate(context);

            // Envío del correo
            await this.transporter.sendMail({
                from: `"Syncro" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html,
            });
        } catch (error) {
            console.error('Error enviando correo:', error);
            throw new InternalServerErrorException('No se pudo enviar el correo');
        }
    }
}
