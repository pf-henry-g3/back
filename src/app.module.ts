import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule} from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { BandModule } from './modules/band/band.module';
import typeorm from './config/typeorm';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('typeorm')!,
    }),
    UserModule,
    BandModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
