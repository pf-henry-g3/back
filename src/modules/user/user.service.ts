import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Genre } from '../genre/entities/genre.entity';
import { UpdateResultDto } from '../file-upload/dto/update-result.dto';
import * as bcrypt from 'bcryptjs';
import usersData from '../../data/users.data.json';
import { Role } from '../role/entities/role.entity';
import { FileUploadService } from '../file-upload/file-upload.service';
import { AbstractFileUploadService } from '../file-upload/file-upload.abstract.service';

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

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(page: number = 1, limit: number = 30) {
    let users = await this.usersRepository.find();

    if (!users) throw new NotFoundException("Usuarios no encontrados");

    const start = (page - 1) * limit;
    const end = page + limit;

    let usersWithOutPassword = users.map((user) => {
      const { password, ...userWithOutPassword } = user;
      return userWithOutPassword;
    })

    return usersWithOutPassword = usersWithOutPassword.slice(start, end);
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

  async findAllByGenre(genreName: string, page: number = 1, limit: number = 30) {
    let genre = await this.genresRepository.findOne({
      where: { name: genreName },
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
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
        urlImage: userData.profilePicture,
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