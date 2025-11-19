import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { Pages } from 'src/common/enums/pages.enum';
import { EntityManager, EntityTarget, FindOneOptions, ObjectLiteral } from 'typeorm';
import { Role } from '../role/entities/role.entity';
import { plainToInstance } from 'class-transformer';
import { UserAdminResponseDto } from './dto/user-response-admin.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { MailerService as MailerLibrary } from '@nestjs-modules/mailer';
import { TransactionalEmailDto } from 'src/core/mailer/dto/transactional-mail.dto';
import { MailerService } from 'src/core/mailer/mailer.service';

interface HistoricalRelationConfig {
  entity: EntityTarget<any>;
  relationField: string;
  isManyToMany?: boolean;
}

@Injectable()
export class AdminService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly mailerLibrary: MailerLibrary,
    private readonly mailerService: MailerService,
  ) { }
  async findEntites<T extends ObjectLiteral>(
    entityClass: EntityTarget<T>,
    page: number = Pages.Pages,
    limit: number = Pages.Limit,
    withDeleted: boolean = false,
    options: FindOneOptions<T> = {}
  ) {
    const repository = this.entityManager.getRepository(entityClass);
    const skip = (page - 1) * limit;

    // Debug para ver si es demora de la db
    const start = Date.now();

    const [data, total] = await repository.findAndCount({
      ...options,
      skip,
      take: limit,
      withDeleted,
    });
    console.log("DB TIME:", Date.now() - start);

    if (!data.length && !withDeleted) {
      throw new NotFoundException(`Entidad no encontrados.`)
    }


    return { meta: { total, page, limit }, data };
  }

  async findOneEntityByID<T extends ObjectLiteral>(
    entityClass: EntityTarget<T>,
    id: string,
    withDeleted: boolean = false,
    options: FindOneOptions<T> = {}
  ) {
    const repository = this.entityManager.getRepository(entityClass);

    try {
      const entity = await repository.findOneOrFail({
        ...options,
        where: { id } as any,
        withDeleted,
      });

      return entity;
    } catch (error) {
      throw new NotFoundException(`Entidad con ID ${id} no encontrado.`);
    }

  }

  async findHistoricalRelations<T extends ObjectLiteral>(
    config: HistoricalRelationConfig,
    parentEntityId: string,
    withDeleted: boolean = false,
    page: number = Pages.Pages,
    limit: number = Pages.Limit,
  ) {
    const { entity, relationField, isManyToMany } = config;
    const repository = this.entityManager.getRepository(entity);
    const skip = (page - 1) * limit;

    if (isManyToMany) {
      const qb = repository.createQueryBuilder('child')
        .innerJoinAndSelect(`child.${relationField}`, 'parent')
        .where('parent.id = :parentId', { parentId: parentEntityId })

        // 🟢 CLAVE: Añadir SELECT explícito para los campos básicos
        // Selecciona todos los campos de la entidad 'child'
        .select(['child', 'parent'])

        .skip(skip)
        .take(limit);

      if (withDeleted) {
        qb.withDeleted();
      }

      const [data, total] = await qb.getManyAndCount();
      return { meta: { total, page, limit }, data };
    }

    // 2. MANEJO DE RELACIONES ONE-TO-MANY (1:N) / FK Directo (Lógica Original)
    const [data, total] = await repository.findAndCount({
      where: {
        [relationField]: { id: parentEntityId }
      } as any,
      skip,
      take: limit,
      withDeleted,
    });

    return { meta: { total, page, limit }, data };
  }

  async sendMassEmail(subject: string, body: string) {
    const usersRepository = await this.entityManager.getRepository(User);

    const users: User[] | null = await usersRepository.find({
      select: ['email', 'name'],
    });

    if (users.length === 0) {
      throw new NotFoundException('No hay usuarios para enviar el email');
    }

    const results = {
      total: users.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    const escapeHtml = (text: string) => {
      const map: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      };
      return text.replace(/[&<>"']/g, (m) => map[m]);
    };

    const safeSubject = escapeHtml(subject);
    const safeBody = escapeHtml(body).replace(/\n/g, '<br>');

    for (const user of users) {
      try {
        await this.mailerLibrary.sendMail({
          to: user.email,
          subject: safeSubject,
          html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333; margin-bottom: 20px;">${safeSubject}</h2>
                    <div style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                      ${safeBody}
                    </div>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; margin-top: 20px;">
                        Este es un mensaje automático de Syncro. Por favor no respondas a este correo.
                    </p>
                  </div>
                    `,
        });
        results.sent++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Error enviando a ${user.email}: ${error.message}`);
      }
    }

    return {
      message: `Emails enviados: ${results.sent} de ${results.total}`,
      total: results.total,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors,
    };
  }

  async newAdmin(id: string, rolName: string) {
    const usersRepository = this.entityManager.getRepository(User);
    const rolesRepository = this.entityManager.getRepository(Role);

    const foundRole: Role | null = await rolesRepository.findOne({
      where: ({ name: rolName })
    });

    if (!foundRole) throw new NotFoundException('El rol no es valido.');

    const user: User | null = await usersRepository.findOne({
      where: { id },
      relations: { roles: true }
    });

    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const updatedRoles = [...user.roles, foundRole];
    user.roles = updatedRoles;

    await usersRepository.save(user);

    return plainToInstance(UserAdminResponseDto, user, {
      excludeExtraneousValues: true,
    })
  }

  async banUser(id: string, banUserdto: BanUserDto) {
    const usersRepository = this.entityManager.getRepository(User);
    const foundUser: User | null = await usersRepository.findOneBy({ id });

    if (!foundUser) throw new NotFoundException('Usuario no encontrado.');

    foundUser.isBanned = true;
    foundUser.reasonForBan = banUserdto.reason;

    await usersRepository.save(foundUser);

  }

  async unbanUser(id: string) {
    const usersRepository = this.entityManager.getRepository(User);
    const foundUser: User | null = await usersRepository.findOne({
      where: { id },
      withDeleted: true
    });

    if (!foundUser) throw new NotFoundException('Usuario no encontrado.');

    foundUser.isBanned = false;
    foundUser.reasonForBan = null;

    if (foundUser.deleteAt) {
      await usersRepository.restore(id);
    }

    await usersRepository.save(foundUser);

    return plainToInstance(UserAdminResponseDto, foundUser, {
      excludeExtraneousValues: true,
    })
  }

  async softDeleteEntity<T extends ObjectLiteral>(
    entityClass: EntityTarget<T>,
    id: string,
  ) {
    const repository = this.entityManager.getRepository(entityClass);
    const result = await repository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`No se pudo realizar el borrado lógico de la entidad con ID ${id}.`);
    }
  }

  async hardDeleteEntity<T extends ObjectLiteral>(
    entityClass: EntityTarget<T>,
    id: string,
  ) {
    const repository = this.entityManager.getRepository(entityClass);
    const result = await repository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`No se pudo realizar el borrado fisico de la entidad con ID ${id}.`);
    }
  }
}
