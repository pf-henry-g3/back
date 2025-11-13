import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

export const mailerConfig = (): MailerOptions => ({
    transport: {
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    },
    defaults: {
        from: '"Syncro" <no-reply@syncro.com>',
    },
    template: {
        dir: join(__dirname, '..', 'common', 'mail-templates'),
        adapter: new HandlebarsAdapter(),
        options: {
            strict: true,
            extName: '.hbs',
        },
    },
});
