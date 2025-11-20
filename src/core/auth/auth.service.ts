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
      const email = await this.userVerificationService.sendEmail(createUserDto.email);
    } catch (err) {
      // No bloquear el registro si el correo falla
    }

    const tranformedUser = plainToInstance(UserMinimalResponseDto, newUser, {
      excludeExtraneousValues: true,
    });

    return { tranformedUser };
  }

  async signin(loginUser: LoginUserDto) {
    if (!loginUser.email || !loginUser.password) throw new BadRequestException('Email y contraseña obligatorios');

    const user = await this.usersRepository.findOne({
      where: { email: loginUser.email },
      relations: ['roles']
    });

    // Por seguridad, no revelamos si el usuario existe o no
    // Pero verificamos condiciones específicas antes de decir "credenciales inválidas"
    if (!user) {
      throw new BadRequestException('Credenciales invalidas');
    }

    if (user.isBanned) {
      throw new BadRequestException('Tu cuenta ha sido baneada. Contacta con un administrador.');
    }

    if (!user.password) {
      throw new BadRequestException('Este usuario utiliza autenticación externa. Iniciá sesión con Google.');
    }

    const isPasswordValid = await bcrypt.compare(loginUser.password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Credenciales invalidas');
    }

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

  async syncAuth0User(auth0Payload: any, userAuth0Data: any) {

    const auth0User = userAuth0Data?.user || userAuth0Data;

    if (!auth0User) {
      throw new BadRequestException('No se recibieron datos del usuario de Auth0');
    }

    console.log('👤 Datos del usuario de Auth0:', auth0User);

    let user = await this.usersRepository.findOne({
      where: { authProviderId: auth0User.sub },
      relations: ['roles']
    });

    if (!user) {
      console.log('🔍 Usuario no encontrado por authProviderId, buscando por email...');

      user = await this.usersRepository.findOne({
        where: { email: auth0User.email },
        relations: ['roles']
      });
    }

    if (user && user.isBanned) {
      throw new BadRequestException('Tu cuenta ha sido baneada. Contacta con un administrador.');
    }

    if (user) {
      console.log('✅ Usuario encontrado por email, vinculando con Auth0...');
      user.authProviderId = auth0User.sub;

      if (auth0User.picture) user.urlImage = auth0User.picture;
      if (auth0User.name && !user.name) user.name = auth0User.name;

      user.isVerified = true;

      await this.usersRepository.save(user);
      console.log('✅ Usuario ya existía:', user.email);
    }

    if (!user) {
      console.log('🆕 Creando nuevo usuario desde Auth0...');

      const baseUsername = auth0User.nickname || auth0User.email.split('@')[0];
      let userName = baseUsername;
      let counter = 1;

      while (await this.usersRepository.findOne({ where: { userName } })) {
        userName = `${baseUsername}${counter}`;
        counter++;
      }

      user = this.usersRepository.create({
        email: auth0User.email,
        name: auth0User.name || auth0User.nickname,
        userName,
        authProviderId: auth0User.sub,
        urlImage: auth0User.picture || 'https://res.cloudinary.com/dgxzi3eu0/image/upload/v1761796743/NoPorfilePicture_cwzyg6.jpg',
        password: null,
        isVerified: true,
      });

      user = await this.usersRepository.save(user);
      console.log('✅ Usuario creado:', user.email);
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles?.map(r => r.name) || [],
    };

    const token = this.jwtService.sign(payload);
    console.log('🎟️ Token generado para el usuario');

    const transformedUser = plainToInstance(UserMinimalResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return {
      login: true,
      access_token: token,
      tranformedUser: transformedUser
    };
  }

  async getLoguedUser(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'leaderOf'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return plainToInstance(UserMinimalResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
