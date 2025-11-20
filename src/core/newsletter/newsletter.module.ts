import { Module } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { MailerModule } from '../mailer/mailer.module';
import { UserModule } from 'src/domain/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/domain/user/entities/user.entity';

@Module({
  imports: [
    MailerModule,
    UserModule,
    TypeOrmModule.forFeature([User])
  ],
  providers: [NewsletterService],
})
export class NewsletterModule { }
