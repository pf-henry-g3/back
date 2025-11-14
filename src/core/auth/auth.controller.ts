import { Controller, Post, Body, HttpCode, Req, UseGuards, Res, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { Auth0Guard } from '../../common/guards/Auth0.guard';
import { cookieConfig } from 'src/config/cookie.config';
import type { Response } from 'express';
import { passportJwtSecret } from 'jwks-rsa';
import { RESPONSE_PASSTHROUGH_METADATA } from '@nestjs/common/constants';
import { PassThrough } from 'stream';
import { commonResponse } from 'src/common/utils/common-response.constant';


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
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
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
  async signin(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.signin(loginUserDto);
    const token = result.data.access_token

    res.cookie('access_token', token, cookieConfig)

    delete result.data.access_token;

    return result
  }

  @Post('auth0/callback')
  @UseGuards(Auth0Guard) //El guard Verifica el token
  async syncAuth0User(
    @Body() Auth0User,
    @Res({ passthrough: true }) res: Response) {

    const result = await this.authService.syncAuth0User(Auth0User); //Sincorniza con el user de la db
    const token = result.data.access_token;
    res.cookie('access_token', token, cookieConfig);

    delete result.data.access_token;
    console.log('result es: ', result);

    return result
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