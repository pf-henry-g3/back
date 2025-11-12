import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import roles from '../../data/role.data.json'
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { ILike, Like, Repository } from 'typeorm';
import { Pages } from 'src/common/enums/pages.enum';
import { plainToInstance } from 'class-transformer';
import { RoleResponseDto } from 'src/common/dto/role-response.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) { }

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


  async create(createRoleDto: CreateRoleDto) {
    const foundRole = await this.roleRepository.findOneBy({ name: createRoleDto.name });

    if (foundRole) throw new BadRequestException('El rol ya existe');

    const newRole: Role = this.roleRepository.create({ ...createRoleDto });

    await this.roleRepository.save(newRole);

    const transformedRole = plainToInstance(RoleResponseDto, newRole, {
      excludeExtraneousValues: true,
    })

    return transformedRole;
  }

  async findAll(page: number = Pages.Pages, limit: number = Pages.Limit) {
    let [roles, total] = await this.roleRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    if (!roles) throw new NotFoundException("Roles no encontrados");

    const transformedRoles = plainToInstance(RoleResponseDto, roles, {
      excludeExtraneousValues: true,
    });

    const meta = { total, page, limit };

    return { transformedRoles, meta };
  }

  async findRolByName(rolName: string, page: number = Pages.Pages, limit: number = Pages.Limit) {
    const [roles, total] = await this.roleRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        name: ILike(`%${rolName}%`),
      },
    });

    if (!roles) throw new NotFoundException("Roles no encontrados");

    const transformedRoles = plainToInstance(RoleResponseDto, roles, {
      excludeExtraneousValues: true,
    });

    const meta = { total, page, limit };

    return { transformedRoles, meta };
  }

  async softDelete(id: string) {
    const foundRole: Role | null = await this.roleRepository.findOneBy({ id });

    if (!foundRole) throw new NotFoundException("Role no encontrado");

    return await this.roleRepository.softDelete(id);
  }
}
