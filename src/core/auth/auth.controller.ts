import { Controller, Post, Body, HttpCode, Req, UseGuards, Res, Get, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { Auth0Guard } from '../../common/guards/Auth0.guard';
<<<<<<< HEAD
import { cookieConfig } from 'src/config/cookie.config';
import type { Response } from 'express';
import { passportJwtSecret } from 'jwks-rsa';
import { RESPONSE_PASSTHROUGH_METADATA } from '@nestjs/common/constants';
import { PassThrough } from 'stream';
import { commonResponse } from 'src/common/utils/common-response.constant';
import { SetAuthCookieInterceptor } from 'src/common/interceptor/set-auth-cookie.interceptor';

=======
import { commonResponse } from 'src/common/utils/common-response.constant';
>>>>>>> origin/dev

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  @ApiProperty({
    description: 'Regtistro de un nuevo usuario',
  })
  @ApiResponse({
    status: 201,
    description: 'Creacion exitosa con retorno de datos.',
  })
  @HttpCode(201)
  async signup(@Body() createUserDto: CreateUserDto) {
    return commonResponse(
      'Usuario registrado extisamente',
      await this.authService.signup(createUserDto),
    );
  }


  @Post('signin')
  @ApiProperty({
    description: 'Login de un usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Creacion exitosa con retorno de datos.',
  })
  @HttpCode(200)
  @UseInterceptors(SetAuthCookieInterceptor)
  async signin(@Body() loginUserDto: LoginUserDto) {
    return commonResponse(
      'Inicio de sesion exitoso',
      await this.authService.signin(loginUserDto)
    );
  }

  @Post('auth0/callback')
  @UseGuards(Auth0Guard) //El guard Verifica el token
  async auth0Callback(
    @Req() req: any,
    @Body() userAuth) {
    return commonResponse(
      'Usuario registrado extisamente',
      await this.authService.syncAuth0User(req.auth0User, userAuth),
    );
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return commonResponse('Logout exitoso')
  }

  @Get('me')
  @UseGuards(Auth0Guard)
  async getMe(@Req() req: any) {
    commonResponse('Usuario autenticado', req.user)
  }
}