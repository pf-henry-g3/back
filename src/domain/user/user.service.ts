import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { Genre } from '../genre/entities/genre.entity';
import * as bcrypt from 'bcryptjs';
import usersData from '../../data/users.data.json';
import { Role } from '../role/entities/role.entity';
import { FileUploadService } from '../../core/file-upload/file-upload.service';
import { AbstractFileUploadService } from '../../core/file-upload/file-upload.abstract.service';
import { Pages } from 'src/common/enums/pages.enum';
import { plainToInstance } from 'class-transformer';
import { UserPublicResponseDto } from './dto/users-public-response.dto';
import { UserAdminResponseDto } from './dto/user-admin-response.dto';
import { AritstMusicalInstrument } from '../musical-instrument/entities/artist-musical-instrument.entity';
import { BandMember } from '../band/entities/bandMember.entity';
import { Band } from '../band/entities/band.entity';
import { MusicalInstrument } from '../musical-instrument/entities/musical-instrument.entity';
import { AddInstrumentsDto } from './dto/add-instruments.dto';
import { TransactionalEmailDto } from 'src/core/mailer/dto/transactional-mail.dto';
import { MailerService } from 'src/core/mailer/mailer.service';
import { Application } from '../application/entities/application.entity';
import { Review } from '../review/entities/review.entity';
import { VacancyResponseDto } from '../vacancy/dto/vacancy-response.dto';


type UserRelationName = 'roles' | 'genres';
type UserRelationEntity = Role | Genre;
type EntityRepository = Repository<any>;


@Injectable()
export class UserService extends AbstractFileUploadService<User> { //Extiende al metodo abstracto de subida de archivos
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Genre)
    private readonly genresRepository: Repository<Genre>,

    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,

    @InjectRepository(AritstMusicalInstrument)
    private readonly artistMusicalInstrumentsRepository: Repository<AritstMusicalInstrument>,

    @InjectRepository(MusicalInstrument)
    private readonly musicalInstrumentsRepository: Repository<MusicalInstrument>,

    @InjectRepository(Band)
    private readonly bandsRepository: Repository<Band>,

    @InjectRepository(BandMember)
    private readonly bandMembersRepository: Repository<BandMember>,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,

    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,

    private readonly entityManage: EntityManager,

    private readonly mailerService: MailerService,

    fileUploadService: FileUploadService
  ) { super(fileUploadService, usersRepository); }

  async findAll(page: number = Pages.Pages, limit: number = Pages.Limit, forAdmin: boolean = false) {
    let [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        genres: true,
        roles: true,
        memberships: { band: true },
        leaderOf: true,
        musicalInstruments: { instrument: true },
        applicationsAsApplicant: true,
      },
    });

    if (!users.length) throw new NotFoundException("Usuarios no encontrados");

    const DtoClass = forAdmin ? UserAdminResponseDto : UserPublicResponseDto;
    const transformedUsers = plainToInstance(DtoClass, users, {
      excludeExtraneousValues: true,
    });

    const meta = { total, page, limit };

    return { transformedUsers, meta };
  }

  async findOne(
    id: string,
    options?: {
      relations?: string[],
      throwIfNotFound?: boolean
    }
  ) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: options?.relations?.reduce((acc, rel) => ({ ...acc, [rel]: true }), {}),
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    const transformedUser = plainToInstance(UserAdminResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return transformedUser;
  }

  async updateProfilePicture(file: Express.Multer.File, userId: string) {
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    //Llama al metodo abstracto heredado
    return this.uploadImage(file, userId);
  }

  async update(id: string, updateUserDto: UpdateUserDto, requestingUser?: User) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: {
        genres: true,
        roles: true,
        memberships: { band: true },
        leaderOf: true,
        musicalInstruments: { instrument: true },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    //Si el DTO tiene nuevos roles
    if (updateUserDto.newRoles && updateUserDto.newRoles.length > 0) {
      // Verificar si se intenta asignar Admin o SuperAdmin
      const adminRoles = ['Admin', 'SuperAdmin'];
      const tryingToAssignAdmin = updateUserDto.newRoles.some(role => adminRoles.includes(role));

      if (tryingToAssignAdmin && requestingUser) {
        const requestingUserRoles = requestingUser.roles?.map(r => r.name) || [];
        const isSuperAdmin = requestingUserRoles.includes('SuperAdmin');

        if (!isSuperAdmin) {
          throw new BadRequestException('Solo los SuperAdmin pueden asignar roles de Admin o SuperAdmin');
        }
      }

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
    await this.usersRepository.save(user);

    return plainToInstance(UserPublicResponseDto, user, {
      excludeExtraneousValues: true
    })
  }

  async getAllVacancies(id: string) {
    const user: User | null = await this.usersRepository.findOne({
      where: { id },
      relations: {
        vacancies: true,
      }
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.vacancies.length === 0) throw new BadRequestException('usuario sin vacantes publciadas');

    return plainToInstance(VacancyResponseDto, user.vacancies, {
      excludeExtraneousValues: true,
    })
  }

  async updateRating(userId: string) {
    const { avg } = await this.reviewsRepository
      .createQueryBuilder("review")
      .select("AVG(review.score)", "avg")
      .where("review.receptor = :userId", { userId })
      .getRawOne();

    const newRating = avg ? parseFloat(avg) : 0;

    const roundedRating = Number(newRating.toFixed(1));

    await this.usersRepository.update(userId, {
      averageRating: roundedRating
    });
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

  async banUser(id: string, reason?: string) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.isBanned = true;
    if (reason) {
      user.reasonForBan = reason;
    }

    await this.usersRepository.save(user);

    return plainToInstance(UserPublicResponseDto, user, {
      excludeExtraneousValues: true
    });
  }

  async unbanUser(id: string) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.isBanned = false;
    user.reasonForBan = null;

    await this.usersRepository.save(user);

    return plainToInstance(UserPublicResponseDto, user, {
      excludeExtraneousValues: true
    });
  }

  async removeManyToManyRelation(userId: string, relationName: UserRelationName, itemName: string) {
    let relatedRepo: EntityRepository;
    let relationProperty: 'roles' | 'genres';

    if (relationName === 'roles') {
      relatedRepo = this.rolesRepository;
      relationProperty = 'roles';
    } else if (relationName === 'genres') {
      relatedRepo = this.genresRepository;
      relationProperty = 'genres';
    } else {
      throw new Error('Relacion no soportada por este metodo');
    }

    const foundUser: User | null = await this.usersRepository.findOne({
      where: { id: userId },
      relations: [relationName],
    })

    if (!foundUser) throw new NotFoundException('Usuario no encontrado');

    const itemToRemove = await relatedRepo.findOneBy({ name: itemName }) as any;

    if (!itemToRemove) throw new NotFoundException(`${relationName} ${itemName} no encontrado`);

    const updatedCollection = foundUser[relationProperty].filter(
      (item: any) => item.id !== itemToRemove.id
    );

    (foundUser as any)[relationProperty] = updatedCollection;

    await this.usersRepository.save(foundUser);

    return plainToInstance(UserPublicResponseDto, foundUser, {
      excludeExtraneousValues: true
    });
  }

  async addInstruments(id: string, addInstrumentsDto: AddInstrumentsDto) {
    const foundUser: User | null = await this.usersRepository.findOne({
      where: { id },
      relations: ['musicalInstruments', 'musicalInstruments.instrument'],
    });

    if (!foundUser) throw new NotFoundException('Usuario no encontrado');

    const instrumentNames = addInstrumentsDto.newInstruments.map(item => item.name);

    const foundInstrumentsEntities = await this.musicalInstrumentsRepository.find({
      where: instrumentNames.map((name) => ({ name }))
    });

    if (foundInstrumentsEntities.length !== instrumentNames.length) {
      const foundNamesSet = new Set(foundInstrumentsEntities.map(instrument => instrument.name));
      const notFoundNames = instrumentNames.filter(name => !foundNamesSet.has(name));
      throw new BadRequestException(`Algunos instrumentos agregados no existen. Instrumentos inválidos: ${notFoundNames.join(', ')}`);
    }

    const existingInstrumentIds = new Set(
      foundUser.musicalInstruments.map(ami => ami.instrument.id)
    );

    const instrumentsToCreate: AritstMusicalInstrument[] = [];
    const createdInstrumentIds = new Set();

    for (const instrumentData of addInstrumentsDto.newInstruments) {

      // Buscar la entidad completa (MusicalInstrument)
      const instrumentEntity = foundInstrumentsEntities.find(e => e.name === instrumentData.name);

      // Validar si es un instrumento nuevo para el usuario y no duplicado en el input
      if (
        instrumentEntity &&
        !existingInstrumentIds.has(instrumentEntity.id) &&
        !createdInstrumentIds.has(instrumentEntity.id)
      ) {

        // CREAR INSTANCIA DE LA TABLA INTERMEDIA (ArtistMusicalInstrument)
        const newArtistInstrument = new AritstMusicalInstrument();

        newArtistInstrument.user = foundUser;
        newArtistInstrument.instrument = instrumentEntity;
        newArtistInstrument.level = instrumentData.level;

        instrumentsToCreate.push(newArtistInstrument);
        createdInstrumentIds.add(instrumentEntity.id);
      }
    }

    if (instrumentsToCreate.length === 0) throw new BadRequestException("Los instrumentos proporcionados ya están asignados o son duplicados en el listado.");

    // 7. ASIGNAR y GUARDAR

    // Merge de los objetos existentes con los nuevos objetos de la tabla intermedia
    foundUser.musicalInstruments = [
      ...foundUser.musicalInstruments,
      ...instrumentsToCreate
    ];

    // Al guardar el User, TypeORM insertará las nuevas filas en AritstMusicalInstrument
    const savedUser = await this.usersRepository.save(foundUser);

    // Retornar la respuesta
    return plainToInstance(UserPublicResponseDto, savedUser, {
      excludeExtraneousValues: true
    });
  }

  async removeMusicalInstrument(id: string, instrumentName: string) {
    const foundInstrument: MusicalInstrument | null = await this.musicalInstrumentsRepository.findOne({
      where: { name: instrumentName },
    });

    if (!foundInstrument) throw new NotFoundException('Instrumento no encontrado');

    const deleteResult = await this.artistMusicalInstrumentsRepository.softDelete({
      user: { id },
      instrument: { id: foundInstrument.id },
    });


    if (deleteResult.affected === 0) throw new NotFoundException('El usuario no tiene ese instrumento');

    return 'Instrumento eliminado correctamente'
  }

  async leaveABand(user: User, bandName: string) {
    const foundBand: Band | null = await this.bandsRepository.findOne({
      where: { bandName },
      relations: ['leader'],
    });

    if (!foundBand) throw new NotFoundException('Banda no encontrada');

    const deleteResult = await this.bandMembersRepository.softDelete({
      user: { id: user.id },
      band: foundBand
    });

    if (deleteResult.affected === 0) throw new NotFoundException('El usuario no es miembro de esta banda');

    let emailDto: TransactionalEmailDto = {
      to: user.email,
      name: user.name,
      pageTitle: `Has abandonado ${foundBand.bandName}`,
      mainTitle: `¡Lamentamos mucho que te vayas!`,
      mainMessage: `Has dejado de ser miembro de ${foundBand.bandName}, lamentamos mucho tu partida pero siempre hay mas proyectos de los cuales formar parte!`,
      buttonText: 'Ver vacantes disponibles',
      actionUrl: `${process.env.FRONTEND_URL}/home`,

      appName: 'Syncro',
      year: new Date().getFullYear(),
      secondaryMessage: 'Si no reconoces esta accion, podes ignorar este mensaje'
    };

    await this.mailerService.sendTransactionalEmail(emailDto);

    emailDto = {
      to: foundBand.leader.email,
      name: foundBand.leader.name,
      pageTitle: `Un miembro de ${foundBand.bandName} se ha ido`,
      mainTitle: `¡Lo lamentamos mucho!`,
      mainMessage: `${user.userName} ha dejado de ser miembro de ${foundBand.bandName}, lamentamos mucho su partida pero siempre hay mas artistas ansiosos de tocar junto a ustedes!`,
      buttonText: 'Ver artistas disponibles',
      actionUrl: `${process.env.FRONTEND_URL}/home`,

      appName: 'Syncro',
      year: new Date().getFullYear(),
      secondaryMessage: 'Si no reconoces esta accion, podes ignorar este mensaje'
    };

    await this.mailerService.sendTransactionalEmail(emailDto);

    return 'Saliste de la banda correctamente'
  }

  async seedUsers() {
    console.log('⏳ Precargando usuarios...');

    for (const userData of usersData) {
      try {
        const existingUser = await this.usersRepository.findOne({
          where: [
            { email: userData.email },
            { userName: userData.userName }
          ],
          withDeleted: true,
        });
        if (existingUser) {
          console.log(`⚠️ Usuario ${userData.email} o ${userData.userName} ya existe, saltando...`);
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
      } catch (error: any) {
        if (error.code === '23505' || error.message?.includes('duplicate key')) {
          console.log(`⚠️ Usuario ${userData.email} o ${userData.userName} ya existe (error de constraint), saltando...`);
          continue;
        }
        console.error(`❌ Error creando usuario ${userData.email}:`, error.message);
      }
    }

    console.log('🎉 Precarga de usuarios completada.');
  }
  async getApplications(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.applicationRepo.find({
      where: {
        applicantId: { id: userId },
      },
      relations: { vacancyId: true },
      order: { applicationDate: 'DESC' },
    });
  }
}