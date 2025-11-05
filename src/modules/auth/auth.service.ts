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
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
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

    return `Usuario ${userData.userName} creado exitosamente`;
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
    console.log('usuario', payload)

    const token = this.jwtService.sign(payload);

    const { password, ...userWithoutPassword } = user;

    const data = { login: true, access_token: token, userWithoutPassword }

    return ApiResponse('Success Login. ', data)
  }


  async syncAuth0User(auth0User: any) {
    if (!auth0User?.email) {
      throw new Error('No email found in Auth0 user');
    }

    let user = await this.usersRepository.findOne({ where: { email: auth0User.email } });

    //pedirle al usuario si comparte la fecha para agregar birthdat (opcional)
    if (!user) {
      user = this.usersRepository.create({
        email: auth0User.email,
        name: auth0User.name,
        userName: auth0User.nickname,
        authProviderId: auth0User.sub,
        urlImage: auth0User.picture,
      });
      console.log(`Usuario ${auth0User.name} agregado correctamente a la DB. `);

      await this.usersRepository.save(user);
    }
    //Mejorar esta logica    
    else {
      console.log("El email ya se encuentra registrado en la base de datos. ");
      //Si el usuario esta registrado manda un error, tendría que automaticamente iniciar sesion.
      throw new BadRequestException("El email ya se encuentra registrado en la base de datos.")
    }
    return user;
  }
}
