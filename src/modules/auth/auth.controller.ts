import { Controller, Post, Body, HttpCode, Get, Req, Param, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { Auth0Guard } from './guards/Auth0.guard';

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
  signin(@Body() loginUserDto: LoginUserDto) {
    return this.authService.signin(loginUserDto);
  }


  @Post('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  resendVerification(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }

  @Post('auth0/callback')
  @UseGuards(Auth0Guard) //El guard Verifica el token
  async auth0Callback(
    @Req() req: any,
    @Body() userFront) {
    return this.authService.syncAuth0User(req.auth0User, userFront); //Sincorniza con el user de la db
  }

  //SignOut ?
}
