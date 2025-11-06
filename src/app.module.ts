import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { GenreModule } from './modules/genre/genre.module';
import { RoleModule } from './modules/role/role.module';
import typeorm from './config/typeorm';
import { VacancyModule } from './modules/vacancy/vacancy.module';
import { SeederModule } from './modules/seeder/seeder.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { SearchModule } from './modules/search/search.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { MailerConfigModule } from './modules/mailer/mailer.module';

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
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1h',
      },
      global: true,
    }),
    MailerConfigModule,
  ],
  controllers: [AppController]
})
export class AppModule { }
