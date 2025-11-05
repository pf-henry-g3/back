import { Injectable, NestMiddleware } from '@nestjs/common';
import { auth } from 'express-openid-connect';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private authMiddleware;

  constructor() {
    this.authMiddleware = auth({
      authRequired: false,
      auth0Logout: true,
      secret: process.env.AUTH0_SECRET,
      baseURL: process.env.BASE_URL || 'http://localhost:3000',
      clientID: process.env.AUTH0_CLIENT_ID,
      issuerBaseURL: process.env.AUTH0_ISSUER,
    });
  }

  use(req: any, res: any, next: () => void) {
    this.authMiddleware(req, res, next);
  }
}
