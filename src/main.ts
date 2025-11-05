import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { auth } from 'express-openid-connect'
import morgan from 'morgan';


async function bootstrap() {
  const app = await NestFactory.create(AppModule); //Traemos a la aplicacion de nest
  app.use(
    auth({
      authRequired: false,
      auth0Logout: true,
      secret: process.env.AUTH0_SECRET,
      baseURL: process.env.BASE_URL,
      clientID: process.env.AUTH0_CLIENT_ID,
      issuerBaseURL: process.env.AUTH0_ISSUER,
      routes: {
        // 👇 aquí definís tus rutas personalizadas
        login: '/login',
        logout: '/logout',
        callback: '/callback'
      },
    })
  );

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

  //conexion entre front y back

  const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:3013',
    'https://syncroapp.us.auth0.com',
    process.env.FRONTEND_URL,
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3013);


}

bootstrap();
