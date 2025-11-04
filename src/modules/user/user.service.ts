import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/create-user.dto';
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
export class UserService extends AbstractFileUploadService<User> { //Extiende al metodo abstracto de subida de archivos
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

  async findAll(page: number = Pages.Pages, limit: number = Pages.Limit) {
    let [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        genres: true,
        memberships: true,
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
        memberships: true,
      },
      withDeleted: true, //incluye a los eliminados TypeORM los elimina de la consulta automaticamente
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
        memberships: true,
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
        genres: true,
        roles: true
        //bandas
        //reviews
        //instrumentos
        //media
        //pagos
        //socialLinks
      },
      withDeleted: true, //incluye a los eliminados TypeORM los elimina de la consulta automaticamente
    });

    if (!user) throw new NotFoundException('Usuario no encontrado entre los usuarios eliminados');

    const { password, ...userWithOutPassword } = user;

    return userWithOutPassword;
  }

  async updateProfilePicture(file: Express.Multer.File, userId: string) {
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    //Llama al metodo abstracto heredado
    return this.uploadImage(file, userId);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: {
        genres: true,
        roles: true,
      }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    //Si el DTO tiene nuevos roles
    if (updateUserDto.newRoles && updateUserDto.newRoles.length > 0) {
      const foundRoles = await this.rolesRepository.find({
        where: updateUserDto.newRoles?.map((name) => ({ name })) //Buscamos todos los roles recibidos en la tabla roles
      });

      //Manejo de error, si hay la longitud de los roles encontrados y los agregados no coincide hay roles invalidos
      if (foundRoles.length !== updateUserDto.newRoles?.length) {
        const foundNames = new Set(foundRoles.map(role => role.name)); //Set de roles validos
        const notFoundNames = updateUserDto.newRoles.filter(name => !foundNames.has(name)); //Comparacion, devuelve los roles invalidos

        throw new BadRequestException(`Algunos roles agregados no existen. Roles invalidos: ${notFoundNames.join(', ')}`)
      }

      //Set de roles validos
      const existingRoles = new Set(user.roles.map(role => role.id));

      //Comparacion con los roles actuales, devuelve los roles nuevos
      const rolesToMerge = foundRoles.filter(
        role => !existingRoles.has(role.id)
      );

      //Merge de los roles actuales y nuevos
      const updatedRoles = [...user.roles, ...rolesToMerge];
      user.roles = updatedRoles;

    }

    //idem pero para generos nuevos
    if (updateUserDto.newGenres && updateUserDto.newGenres.length > 0) {
      const foundGenres = await this.genresRepository.find({
        where: updateUserDto.newGenres?.map((name) => ({ name }))
      });

      //Manejo de error, si hay la longitud de los generos encontrados y los agregados no coincide hay roles invalidos
      if (foundGenres.length !== updateUserDto.newGenres?.length) {
        const foundNames = new Set(foundGenres.map(role => role.name)); //Set de roles validos
        const notFoundNames = updateUserDto.newGenres.filter(name => !foundNames.has(name)); //Comparacion, devuelve los roles invalidos

        throw new BadRequestException(`Algunos generos agregados no existen. Generos invalidos: ${notFoundNames.join(', ')}`)
      }

      const existingGenres = new Set(user.genres.map(genre => genre.id));

      const genresToMerge = foundGenres.filter(
        genre => !existingGenres.has(genre.id)
      );

      const updatedRoles = [...user.genres, ...genresToMerge];
      user.genres = updatedRoles;

    }

    //Actualizacion de datos simples usando Object de JavaScript
    Object.assign(user, updateUserDto);

    //Guardar cambios en la base de datos
    return await this.usersRepository.save(user);
  }

  async softDelete(id: string) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    //previamente el DTO tiene agregado @DeleteDateColumn
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