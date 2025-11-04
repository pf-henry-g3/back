import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import bcrypt from 'node_modules/bcryptjs';
import { ApiResponse } from 'src/helper/api-response';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }
  async signup(createUserDto: CreateUserDto) {
    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
      withDeleted: true,
    });

    if (existingUser) {
      if (existingUser.deleteAt) {
        existingUser.deleteAt = null;
        Object.assign(existingUser, createUserDto);
        return await this.userRepository.save(existingUser);
      } else {
        throw new BadRequestException({
          success: false,
          message: `El usuario con email ${createUserDto.email} ya se encuentra registrado `,
          existingUser,
        });
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const { confirmPassword, password, ...userSinPass } = createUserDto;

    const newUser = await this.userRepository.create({
      ...userSinPass,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser)

    const { password: _, ...userResponse } = newUser;

    return ApiResponse('Created User.', newUser);
  }

  async signin(loginUser: LoginUserDto) {
    const user = await this.userRepository.findOneBy({ email: loginUser.email });
    if (!user) {
      throw new BadRequestException('Credenciales invalidas');
    }
    const isPasswordValid = await bcrypt.compare(loginUser.password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Credenciales invalidas.');
    }

    const payload = {
      sub: user.id, // "sub" es el estándar para el ID del usuario
      email: user.email
    };

    const token = this.jwtService.sign(payload);

    const { password: _, ...userWithoutPassword } = user;

    return ApiResponse('Success Login. ', user)
  }

}
