import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/user/entities/user.entity';
import bcrypt from 'node_modules/bcryptjs';
import { commonResponse } from 'src/common/utils/common-response.constant';
import { JwtService } from '@nestjs/jwt';
import { UserVerificationService } from 'src/domain/user/userVerification.service';
import { plainToInstance } from 'class-transformer';
import { UserMinimalResponseDto } from 'src/common/dto/user-minimal-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly userVerificationService: UserVerificationService,
    private readonly jwtService: JwtService,
  ) { }

  async signup(createUserDto: CreateUserDto) {
    const { confirmPassword, ...userData } = createUserDto

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

    try {
      await this.userVerificationService.sendEmail(createUserDto.email);
    } catch (err) {
      // No bloquear el registro si el correo falla
    }

    const tranformedUser = plainToInstance(UserMinimalResponseDto, newUser, {
      excludeExtraneousValues: true,
    });

    return tranformedUser;
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

    // if (!user.isVerified) {
    //   throw new BadRequestException('Tu cuenta aún no está verificada.');
    // }

    const token = this.jwtService.sign(payload);

    const tranformedUser = plainToInstance(UserMinimalResponseDto, user, {
      excludeExtraneousValues: true,
    })

    return { login: true, access_token: token, tranformedUser }
  }

  async syncAuth0User(auth0Payload: any, userFront) {
    userFront = userFront.user

    let user = await this.usersRepository.findOne({
      where: { authProviderId: auth0Payload.sub }
    });


    if (!user) {
      user = await this.usersRepository.findOne({
        where: { email: userFront.email }
      });

      if (user) {
        user.authProviderId = auth0Payload.sub;

        if (userFront.picture) user.urlImage = userFront.picture;
        if (userFront.name && !user.name) user.name = userFront.name;

        user.isVerified = true;

        await this.usersRepository.save(user);
      }
    }

    if (!user) {
      const baseUsername = userFront.nickname || userFront.email.split('@')[0];
      let userName = userFront.nickname;
      let counter = 1;

      // Verificar que userName sea único
      while (await this.usersRepository.findOne({ where: { userName } })) {
        userName = `${baseUsername}${counter}`; //agrega numero despues del username existente
        counter++;
      }

      user = this.usersRepository.create({
        email: userFront.email,
        name: userFront.name || userFront.nickname,
        userName,
        authProviderId: auth0Payload.sub,
        urlImage: userFront.picture || 'https://res.cloudinary.com/dgxzi3eu0/image/upload/v1761796743/NoPorfilePicture_cwzyg6.jpg',
        password: null,
        isVerified: true,
      });

      await this.usersRepository.save(user);
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles?.map(r => r.name) || [],
    };

    const token = this.jwtService.sign(payload);

    const tranformedUser = plainToInstance(UserMinimalResponseDto, user, {
      excludeExtraneousValues: true,
    })

    return { login: true, access_token: token, tranformedUser }
  }
}
