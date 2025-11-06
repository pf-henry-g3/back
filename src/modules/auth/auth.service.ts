import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import bcrypt from 'node_modules/bcryptjs';
import { ApiResponse } from 'src/helper/api-response';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService
  ) { }

  async signup(createUserDto: CreateUserDto) {
    const { confirmPassword, ...userData } = createUserDto
    console.log(createUserDto.aboutMe);

    if (confirmPassword !== userData.password) throw new BadRequestException('Las contraseñas no coinciden');

    const user = await this.usersRepository.findOne({
      where: [
        { email: userData.email },
        { userName: userData.userName }
      ],
    })

    if (user) throw new BadRequestException('Usuario ya registrado');

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    if (!hashedPassword) throw new BadRequestException('La contraseña no se pudo hashear')

    const newUser = this.usersRepository.create({ ...userData, password: hashedPassword });
    await this.usersRepository.save(newUser);

    const payload = { email: userData.email };
    const token = this.jwtService.sign(payload, { expiresIn: '1d' });

    const verifyLink = `http://localhost:3000/verify?token=${token}`;

    await this.mailerService.sendMail({
      to: userData.email,
      subject: 'Verificá tu cuenta',
      template: 'verifyEmail', // sin extensión
      context: {
        appName: 'Syncro',
        name: userData.name,
        verificationUrl: verifyLink,
        year: new Date().getFullYear(),
      },
    });

    return `Usuario ${userData.userName} creado exitosamente`;
  }

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersRepository.findOne({
        where: { email: payload.email }
      })

      if (!user) throw new NotFoundException('Usuario no encontrado');

      user.isVerified = true;
      await this.usersRepository.save(user);

      return { message: 'Cuenta verificada correctamente' };

    } catch (error) {
      throw new BadRequestException('Token invalido o expirado');
    }
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.isVerified) throw new BadRequestException('El usuario ya está verificado');

    const payload = { email: user.email };
    const token = this.jwtService.sign(payload, { expiresIn: '1d' });

    const verifyLink = `http://localhost:3000/verify?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Verificá tu cuenta',
      template: './verifyEmail', // sin extensión
      context: {
        name: user.name,
        verifyLink,
      },
    });

    return { message: 'Correo de verificación reenviado correctamente' };
  }

  async signin(loginUser: LoginUserDto) {
    if (!loginUser.email || !loginUser.password) throw new BadRequestException('Email y contraseña obligatorios');

    const user = await this.usersRepository.findOneBy({ email: loginUser.email });

    if (!user) throw new BadRequestException('Credenciales invalidas');

    if (!user.password)
      throw new BadRequestException('Este usuario usa autenticación externa. Iniciá sesión con Google o Auth0.');

    const isPasswordValid = await bcrypt.compare(loginUser.password, user.password);

    if (!isPasswordValid) throw new BadRequestException('Credenciales invalidas.');

    const payload = {
      sub: user.id, // "sub" es el estándar para el ID del usuario
      email: user.email,
      roles: user.roles?.map(r => r.name)
    };

    if (!user.isVerified) {
      throw new BadRequestException('Tu cuenta aún no está verificada.');
    }

    const token = this.jwtService.sign(payload);

    const { password, ...userWithoutPassword } = user;

    const data = { login: true, access_token: token, userWithoutPassword }

    return ApiResponse('Success Login. ', data)
  }

  async syncAuth0User(auth0Payload: any) {
    // auth0Payload viene del token verificado (sub, email, name, etc.)

    let user = await this.usersRepository.findOne({
      where: { authProviderId: auth0Payload.sub },
      relations: ['roles'],
    });

    if (!user) {
      user = await this.usersRepository.findOne({
        where: { email: auth0Payload.email },
        relations: ['roles'],
      });

      if (user) {
        user.authProviderId = auth0Payload.sub;

        if (auth0Payload.picture) user.urlImage = auth0Payload.picture;
        if (auth0Payload.name && !user.name) user.name = auth0Payload.name;

        user.isVerified = true;

        await this.usersRepository.save(user);
        console.log(`Usuario ${user.email} vinculado con Auth0.`);
      }
    }

    // Creo nuevo usuario desde Auth0
    if (!user) {
      const baseUsername = auth0Payload.nickname || auth0Payload.email.split('@')[0];
      let userName = baseUsername;
      let counter = 1;

      // Verificar que userName sea único
      while (await this.usersRepository.findOne({ where: { userName } })) {
        userName = `${baseUsername}${counter}`; //agrega numero despues del username existente
        counter++;
      }

      user = this.usersRepository.create({
        email: auth0Payload.email,
        name: auth0Payload.name || auth0Payload.nickname,
        userName,
        authProviderId: auth0Payload.sub,
        urlImage: auth0Payload.picture || 'https://res.cloudinary.com/dgxzi3eu0/image/upload/v1761796743/NoPorfilePicture_cwzyg6.jpg',
        password: null,
        isVerified: true,
      });

      await this.usersRepository.save(user);
      console.log(`Nuevo usuario ${auth0Payload.email} creado desde Auth0.`);
    }

    // Generar mi propio JWT para mantener sesión
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles?.map(r => r.name) || [],
    };

    const token = this.jwtService.sign(payload);

    const { password, ...userWithoutPassword } = user;

    return ApiResponse('Autenticación exitosa con Auth0', {
      login: true,
      access_token: token,
      user: userWithoutPassword,
    });
  }
}
