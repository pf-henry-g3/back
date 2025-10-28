import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Genres } from '../genre/entities/genre.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    
    @InjectRepository(Genres)
    private readonly genresRepository: Repository<Genres>,
  ) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }
  
  async findAll(page: number = 1, limit: number = 30) {
    let users = await this.usersRepository.find();
    
    if(!users) throw new NotFoundException("Usuarios no encontrados");
    
    const start = (page - 1) * limit;
    const end = page + limit;
    
    let usersWithOutPassword = users.map((user) =>{
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
    
    if(!user) throw new NotFoundException('Usuario no encontrado');
    
    const { password, ...userWithOutPassword } = user;
    
    return userWithOutPassword;
  }

  async findAllByGenre(genreName: String, page: number = 1, limit: number = 30) {
    let genre = await this.genresRepository.findOne({
      where: { name: genreName },
      relations: [ 'users' ],
    });

    if(!genre) throw new NotFoundException('Genero no encontrado');

    const start = (page - 1) * limit;
    const end = page + limit;

    let usersWithOutPassword = genre.users.map((user) =>{
      const { password, ...userWithOutPassword } = user;
      return userWithOutPassword;
    })

    return usersWithOutPassword = usersWithOutPassword.slice(start, end);
  }
  
  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }
  
  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
