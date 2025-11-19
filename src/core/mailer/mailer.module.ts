import { Module, Global } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { mailerConfig } from 'src/core/mailer/mailer.config'; // Importa la configuración existente
import { MailerService } from './mailer.service';
import { User } from 'src/domain/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
    // 1. Importamos el módulo de NestJS/Mailer con la configuración
    imports: [
        TypeOrmModule.forFeature([User]),
        NestMailerModule.forRootAsync({
            useFactory: mailerConfig,
        }),
    ],
    // 2. Declaramos y proveemos nuestro servicio transaccional
    providers: [MailerService],
    // 3. Exportamos nuestro servicio para que otros módulos lo puedan inyectar
    exports: [MailerService],
})
export class MailerModule { }