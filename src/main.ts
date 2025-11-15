import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule); //Traemos a la aplicacion de nest

  app.use(morgan('dev'));
  app.use(cookieParser());


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
    process.env.FRONTEND_URL,
    process.env.BACKEND_URL
  ].filter(Boolean).map((o) => o!.replace(/\/$/, ''));

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const normalized = origin.replace(/\/$/, '');

      // 1. Loggea el Origen entrante y la lista para comparar
      console.log(`[CORS DEBUG] Origin: ${origin}`);
      console.log(`[CORS DEBUG] Normalized: ${normalized}`);
      console.log(`[CORS DEBUG] Allowed: ${allowedOrigins.join(', ')}`);

      if (allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }

      // 2. Loggea el error para ver si la variable de entorno tiene un problema
      console.error(`[CORS ERROR] BLOCKED: Origin ${origin} NOT found in allowed list.`);
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
