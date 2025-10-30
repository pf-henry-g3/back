import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ILike, IsNull, Not, Repository } from 'typeorm';
import { Genre } from '../genre/entities/genre.entity';
import * as bcrypt from 'bcryptjs';
import usersData from '../../data/users.data.json';
import { Role } from '../role/entities/role.entity';
import { FileUploadService } from '../file-upload/file-upload.service';
import { AbstractFileUploadService } from '../file-upload/file-upload.abstract.service';
import { Pages } from 'src/enums/pages.enum';

@Injectable()
export class UserService extends AbstractFileUploadService<User> {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Genre)
    private readonly genresRepository: Repository<Genre>,

    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,

    fileUploadService: FileUploadService
  ) { super(fileUploadService, usersRepository); }

  async create(createUserDto: CreateUserDto) {
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

    return `Usuario ${userData.userName} creado exitosamente`;
  }

  async findAll(page: number = Pages.Pages, limit: number = Pages.Limit) {
    let [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        genres: true,
        meberships: true,
      }
    });

    if (!users) throw new NotFoundException("Usuarios no encontrados");

    let usersWithOutPassword = users.map((user) => {
      const { password, ...userWithOutPassword } = user;
      return userWithOutPassword;
    })

    return {
      meta: {
        total,
        page,
        limit,
      },
      data: usersWithOutPassword,
    };
  }

  async findAllIncludingDeleted(page: number = Pages.Pages, limit: number = Pages.Limit) {
    let [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        genres: true,
        meberships: true,
      },
      withDeleted: true,
    });

    if (!users) throw new NotFoundException("Usuarios no encontrados");

    let usersWithOutPassword = users.map((user) => {
      const { password, ...userWithOutPassword } = user;
      return userWithOutPassword;
    })

    return {
      meta: {
        total,
        page,
        limit,
      },
      data: usersWithOutPassword,
    };
  }

  async findAllDeletedUsers(page: number = Pages.Pages, limit: number = Pages.Limit) {
    let [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        genres: true,
        meberships: true,
      },
      where: { deleteAt: Not(IsNull()) },
      withDeleted: true,
    });

    if (!users) throw new NotFoundException("Usuarios eliminados no encontrados");
    if (!users.length) throw new NotFoundException("Sin usuarios eliminados");

    let usersWithOutPassword = users.map((user) => {
      const { password, ...userWithOutPassword } = user;
      return userWithOutPassword;
    })

    return {
      meta: {
        total,
        page,
        limit,
      },
      data: usersWithOutPassword,
    };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: {
        genres: true
        //bandas
        //reviews
        //instrumentos
        //media
        //pagos
        //socialLinks
      }
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    const { password, ...userWithOutPassword } = user;

    return userWithOutPassword;
  }

  async findOneDeletedUser(id: string) {
    const user = await this.usersRepository.findOne({
      where: {
        id,
        deleteAt: Not(IsNull()),
      },
      relations: {
        genres: true
        //bandas
        //reviews
        //instrumentos
        //media
        //pagos
        //socialLinks
      },
      withDeleted: true,
    });

    if (!user) throw new NotFoundException('Usuario no encontrado entre los usuarios eliminados');

    const { password, ...userWithOutPassword } = user;

    return userWithOutPassword;
  }

  async findAllByGenre(genreName: string, page: number = Pages.Pages, limit: number = Pages.Limit) {
    let genre = await this.genresRepository.findOne({
      where: {
        name: ILike(`%${genreName}%`)
      },
      relations: {
        users: true,
      }
    });

    if (!genre) throw new NotFoundException('Genero no encontrado');

    const [users, total] = await this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.genres', 'genre')
      .where('genre.id = :genreId', { genreId: genre.id })
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    if (!users.length) throw new NotFoundException('No hay usuarios para este genero');

    const usersWithOutPassword = genre.users.map(({ password, ...rest }) => rest)

    return {
      total,
      page,
      limit,
      result: usersWithOutPassword
    }
  }

  async updateProfilePicture(file: Express.Multer.File, userId: string) {
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.uploadImage(file, userId);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.usersRepository.update(id, updateUserDto);

    return `Usuario ${id} actualizado con exito`;
  }

  async softDelete(id: string) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.usersRepository.softDelete(id);

    return `Usuario ${id} eliminado con exito`;
  }

  async seedUsers() {
    console.log('⏳ Precargando usuarios...');

    for (const userData of usersData) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: userData.email },
      });
      if (existingUser) {
        console.log(`⚠️ Usuario ${userData.email} ya existe, saltando...`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = this.usersRepository.create({
        email: userData.email,
        password: hashedPassword,
        userName: userData.userName,
        birthDate: new Date(userData.birthDate),
        name: userData.name,
        aboutMe: userData.aboutMe,
        averageRating: userData.averageRating,
        city: userData.city,
        country: userData.country,
        address: userData.address,
        latitude: userData.latitude,
        longitude: userData.longitude,
      });

      const roles = await this.rolesRepository.find({
        where: userData.rolesSeeder.map((roleName: string) => ({ name: roleName })),
      });

      const genres = await this.genresRepository.find({
        where: userData.genresSeeder.map((genreName: string) => ({ name: genreName })),
      });

      user.roles = roles;
      user.genres = genres;

      await this.usersRepository.save(user);
      console.log(`✅ Usuario ${user.email} creado con ${roles.length} roles y ${genres.length} géneros.`);
    }

    console.log('🎉 Precarga de usuarios completada.');
  }
}