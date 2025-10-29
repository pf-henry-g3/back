import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import roles from '../../data/role.data.json'
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async seederRoles(): Promise<void> {
    for (const role of roles) {
      const roleExists = await this.roleRepository.findOne({
        where: { name: role.name },
      });

      if (!roleExists) {
        const newRole = this.roleRepository.create({ name: role.name });
        await this.roleRepository.save(newRole);
        console.log(`🎭 Rol "${role.name}" creado.`);
      } 
    }
  }


  create(createRoleDto: CreateRoleDto) {
    return 'This action adds a new role';
  }

  findAll() {
    return `This action returns all role`;
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
