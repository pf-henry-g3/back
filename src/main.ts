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
    .setDescription('This is an API for a social network')
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

  // CORS: conexión entre front y back (http local y https en despliegue)
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3013',
    'https://syncroapp.us.auth0.com',
    'http://sincro.72.61.129.102.sslip.io',
    'https://sincro.72.61.129.102.sslip.io',
    'http://72.61.129.102.sslip.io',
    'https://72.61.129.102.sslip.io',
    process.env.FRONTEND_URL_DEPLOY,
    process.env.FRONTEND_URL,
  ].filter(Boolean).map((o) => o!.replace(/\/$/, ''));

  app.enableCors({
    origin: (origin, callback) => {
      // permitir SSR/healthchecks sin origin
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
  });

  await app.listen(process.env.PORT ?? 3013);
  console.log(`App corriendo en puerto ${process.env.PORT}`);



}

bootstrap();
