import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/user/entities/user.entity';
import bcrypt from 'node_modules/bcryptjs';
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
      throw new BadRequestException('Este usuario utiliza autenticación externa. Iniciá sesión con Google.');

    const isPasswordValid = await bcrypt.compare(loginUser.password, user.password);

    if (!isPasswordValid) throw new BadRequestException('Credenciales invalidas.');

    const payload = {
      sub: user.id, // "sub" es el estándar para el ID del usuario
      email: user.email,
      roles: user.roles?.map(r => r.name)
    };

    // if (!user.isVerified) {
    //   await this.userVerificationService.sendEmail(user.email);
    //   throw new BadRequestException('Tu cuenta no está verificada. Te reenviamos un correo de verificación.');
    // }

    const token = this.jwtService.sign(payload);

    const tranformedUser = plainToInstance(UserMinimalResponseDto, user, {
      excludeExtraneousValues: true,
    })

    return { login: true, access_token: token, tranformedUser }
  }

  async syncAuth0User(auth0Payload: any, userAuth0) {
    userAuth0 = userAuth0.user

    let user = await this.usersRepository.findOne({
      where: { authProviderId: userAuth0.sub }
    });


    if (!user) {
      user = await this.usersRepository.findOne({
        where: { email: userAuth0.email }
      });

      if (user) {
        user.authProviderId = userAuth0.sub;

        if (userAuth0.picture) user.urlImage = userAuth0.picture;
        if (userAuth0.name && !user.name) user.name = userAuth0.name;

        user.isVerified = true;

        await this.usersRepository.save(user);
      }
    }

    if (!user) {
      const baseUsername = userAuth0.nickname || userAuth0.email.split('@')[0];
      let userName = userAuth0.nickname;
      let counter = 1;

      // Verificar que userName sea único
      while (await this.usersRepository.findOne({ where: { userName } })) {
        userName = `${baseUsername}${counter}`; //agrega numero despues del username existente
        counter++;
      }

      user = this.usersRepository.create({
        email: userAuth0.email,
        name: userAuth0.name || userAuth0.nickname,
        userName,
        authProviderId: userAuth0.sub,
        urlImage: userAuth0.picture || 'https://res.cloudinary.com/dgxzi3eu0/image/upload/v1761796743/NoPorfilePicture_cwzyg6.jpg',
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
