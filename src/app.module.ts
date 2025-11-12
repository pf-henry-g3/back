import { Module } from '@nestjs/common';
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
import { ReviewModule } from './domain/review/review.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfig } from './config/mailer.config';


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
    MailerModule.forRootAsync({
      useFactory: mailerConfig,
    }),
    UserModule,
    VacancyModule,
    GenreModule,
    RoleModule,
    SeederModule,
    FileUploadModule,
    SearchModule,
    PaymentModule,
    ReviewModule,

    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
      global: true,
    }),
  ]

})
export class AppModule { }
