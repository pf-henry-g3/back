import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MailerModule } from 'src/core/mailer/mailer.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [MailerModule, UserModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService]
})
export class AdminModule { }
