import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './domain/user/user.module';
import { GenreModule } from './domain/genre/genre.module';
import { RoleModule } from './domain/role/role.module';
import typeorm from './config/typeorm';
import { VacancyModule } from './domain/vacancy/vacancy.module';
import { SeederModule } from './core/seeder/seeder.module';
import { FileUploadModule } from './core/file-upload/file-upload.module';
import { SearchModule } from './core/search/search.module';

import { PaymentModule } from './domain/payment/payment.module';

import { AuthModule } from './core/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { MailerConfigModule } from './core/mailer/mailer.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('typeorm')!,
    }),

    UserModule,
    VacancyModule,
    GenreModule,
    RoleModule,
    SeederModule,
    FileUploadModule,
    SearchModule,
    PaymentModule,

    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
      global: true,
    }),
    MailerConfigModule,
  ]

})
export class AppModule { }
