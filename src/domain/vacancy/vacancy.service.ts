import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import vacancysData from '../../data/vacancy.data.json';
import { InjectRepository } from '@nestjs/typeorm';
import { Vacancy } from './entities/vacancy.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Pages } from 'src/common/enums/pages.enum';
import { FileUploadService } from '../../core/file-upload/file-upload.service';
import { AbstractFileUploadService } from '../../core/file-upload/file-upload.abstract.service';
import { Genre } from '../genre/entities/genre.entity';
import { plainToInstance } from 'class-transformer';
import { VacancyResponseDto } from './dto/vacancy-response.dto';
import { TransactionalEmailDto } from 'src/core/mailer/dto/transactional-mail.dto';
import { MailerService } from 'src/core/mailer/mailer.service';
import { Application } from '../application/entities/application.entity';
import { ApplicationResponseDto } from '../application/dto/application-response.dto';

@Injectable()
export class VacancyService extends AbstractFileUploadService<Vacancy> {
  constructor(
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Genre)
    private readonly genresRepository: Repository<Genre>,

    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,

    private readonly mailerService: MailerService,

    fileUploadService: FileUploadService
  ) { super(fileUploadService, vacancyRepository) }


  async create(createVacancyDto: CreateVacancyDto, user: User) {
    const genres = await this.genresRepository.find({
      where: createVacancyDto.genres.map(name => ({ name })),
    });

    if (genres.length !== createVacancyDto.genres.length) {
      throw new BadRequestException('Uno o más géneros no existen en la base de datos.');
    }

    const newVacancy = this.vacancyRepository.create({
      ...createVacancyDto,
      owner: { id: user.id },
      genres,
    })

    const savedVacancy = await this.vacancyRepository.save(newVacancy);

    return savedVacancy;
  }

  async findAll(page: number = Pages.Pages, limit: number = Pages.Limit) {
    const [vacancies, total] = await this.vacancyRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        owner: true,
        genres: true,
        applications: { applicantId: true },
      }
    });

    if (!vacancies) throw new NotFoundException("Vacantes no encontrados");

    const transformedVacancies = plainToInstance(VacancyResponseDto, vacancies, {
      excludeExtraneousValues: true,
    });

    const meta = { total, page, limit };

    return { transformedVacancies, meta };
  }

  async getAllApplications(id: string, page: number = Pages.Pages, limit: number = Pages.Limit) {
    const applications = await this.applicationsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        vacancyId: { id },
      },
      relations: {
        applicantId: true,
      }
    });

    if (!applications) throw new NotFoundException('No hay postulaciones para esa vacante');

    return plainToInstance(ApplicationResponseDto, applications, {
      excludeExtraneousValues: true,
    })
  }

  async findOne(id: string) {
    let foundVacancy = await this.vacancyRepository.findOne({
      where: { id: id },
      relations: {
        owner: true,
        genres: true,
        applications: { applicantId: true },
      }
    });

    if (!foundVacancy) throw new BadRequestException('Vacante no encontrada')

    const transformedVacancy = plainToInstance(VacancyResponseDto, foundVacancy, {
      excludeExtraneousValues: true,
    })

    return transformedVacancy;
  }

  async updateProfilePicture(file: Express.Multer.File, vacancyId: string) {
    const vacancy = await this.vacancyRepository.findOneBy({ id: vacancyId });

    if (!vacancy) {
      throw new NotFoundException('Vacante no encontrado');
    }

    return this.uploadImage(file, vacancyId);
  }

  async closeVacancie(vacancyId: string) {
    const vacancy: Vacancy | null = await this.vacancyRepository.findOneBy({ id: vacancyId });

    if (!vacancy) throw new NotFoundException('Vacante no encontrada');

    vacancy.isOpen = false;

    await this.vacancyRepository.save(vacancy);

    return plainToInstance(VacancyResponseDto, vacancy, {
      excludeExtraneousValues: true,
    })
  }

  async acceptPostulant(vacancyId: string, applicantId: string) {
    const application: Application | null = await this.applicationsRepository.findOne({
      where: {
        vacancyId: { id: vacancyId },
        applicantId: { id: applicantId },
      },
      relations: {
        vacancyId: true,
        applicantId: true,
      }
    });

    if (!application) throw new NotFoundException('Postulacion no encontrada');

    application.status = 'ACCEPTED';

    await this.applicationsRepository.save(application);

    try {
      const verifyLink = `${process.env.FRONTEND_URL}/dashboard/profile}`;

      const emailDto: TransactionalEmailDto = {
        to: application.applicantId.email,
        name: application.applicantId.name,
        pageTitle: 'Aceptaron tu postulacion!',
        mainTitle: '¡Tu postulacion fue aceptada!',
        mainMessage: `Gracias por postularte a ${application.vacancyId.name}`,
        buttonText: 'Ver mis postulaciones',
        actionUrl: verifyLink,

        appName: 'Syncro',
        year: new Date().getFullYear(),
        secondaryMessage: 'Si no reconoces esta accion, podés ignorar este correo.'
      };

      await this.mailerService.sendTransactionalEmail(emailDto);
    } catch (error) {
      console.log('Error al enviar correo de notificacion')
    };

    return plainToInstance(VacancyResponseDto, application.vacancyId, {
      excludeExtraneousValues: true,
    })
  }

  async softDelete(id: string) {
    const foundVacancy: Vacancy | null = await this.vacancyRepository.findOneBy({ id });

    if (!foundVacancy) throw new NotFoundException('Vacante no encontrado');

    return await this.vacancyRepository.softDelete(id)
  }

  async seederVacancies(): Promise<void> {
    console.log('⏳ Precargando vacantes...');
    for (const vacancyData of vacancysData) {

      const existingVacancy = await this.vacancyRepository.findOne({
        where: { name: vacancyData.name }
      });

      if (existingVacancy) {
        console.log(`⚠️ Vacante ${vacancyData.name} ya existe, saltando...`);
        continue;
      }
      const user = await this.usersRepository.findOne({
        where: { userName: vacancyData.vacancyuserName }
      });

      if (!user) {
        console.log(`⚠️ Usuario con nombre ${vacancyData.vacancyuserName} no encontrado, saltando vacante ${vacancyData.name}...`);
        continue;
      }

      const newVacancy = this.vacancyRepository.create(vacancyData);
      newVacancy.owner = user;

      const genres = await this.genresRepository.find({
        where: vacancyData.genresSeeder.map((genreName: string) => ({ name: genreName })),
      });

      newVacancy.genres = genres;

      await this.vacancyRepository.save(newVacancy);
      console.log(`✅ Vacante ${vacancyData.name} creada.`);
    }
    console.log('🎉 Precarga de vacantes completada.');
  }
}
