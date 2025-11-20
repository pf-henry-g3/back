import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

export const mailerConfig = (): MailerOptions => ({
    transport: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    },
    defaults: {
        from: process.env.SMTP_USER,
    },
    template: {
        dir: join(__dirname, '..', '..', 'common', 'mail-templates'),
        adapter: new HandlebarsAdapter(),
        options: {
            strict: true,
            extName: '.hbs',
        },
    },
});
