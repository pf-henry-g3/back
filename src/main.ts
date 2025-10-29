import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); //Traemos a la aplicacion de nest
  
  app.use(morgan('dev'))
  
  const swaggerDoc = new DocumentBuilder()
    .setTitle('PI-BACKEND')
    .setDescription('This is an API for an E-commerce')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build(); //Para que todos estos metodos encadenados construyan el doc inicial

  const documentModule = SwaggerModule.createDocument(app, swaggerDoc); //Le doy acceso de mi app a swagger

  SwaggerModule.setup('docs', app, documentModule); //Agregamos un modulo que tiene una ruta de tipo get /docs que se monta dentro de app y muestra aquello que se contruye con documentModule

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3013); 


}

bootstrap();
