import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Genre } from '../genre/entities/genre.entity';
import { UpdateResultDto } from '../file-upload/dto/update-result.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Genre)
    private readonly genresRepository: Repository<Genre>,

    private readonly fileUploadManager: { uploadImage: (file: Express.Multer.File, id: string) => Promise<UpdateResultDto> }
  ) { }
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

    return this.fileUploadManager.uploadImage(file, userId);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
