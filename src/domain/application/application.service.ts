import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vacancy } from '../vacancy/entities/vacancy.entity';
import { Application } from './entities/application.entity';
import { plainToInstance } from 'class-transformer';
import { ApplicationResponseDto } from './dto/application-response.dto';
import { Pages } from 'src/common/enums/pages.enum';

@Injectable()
export class ApplicationService {
  constructor(

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,
    @InjectRepository(Application)
    private readonly apliRepository: Repository<Application>,

  ) { }

  async create(applicantId: string, createApplicationDto: CreateApplicationDto) {
    const { vacancyId, applicationDescription } = createApplicationDto;


    const vacancy = await this.vacancyRepository.findOne({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      throw new BadRequestException('Vacante no encontrada');
    }

    const applicant = await this.usersRepository.findOne({
      where: { id: applicantId },
    });

    if (!applicant) {
      throw new BadRequestException('Usuario no encontrado');
    }


    const existingApplication = await this.apliRepository.findOne({
      where: {
        vacancyId: { id: vacancyId },
        applicantId: { id: applicantId },
      },
      select: ['id']
    });

    if (existingApplication) throw new BadRequestException('el usuario ya aplico a esta vacante');

    const application = this.apliRepository.create({
      vacancyId: vacancy,
      applicantId: applicant,
      applicationDescription,
      applicationDate: new Date(),
    });

    await this.apliRepository.save(application);

    return plainToInstance(ApplicationResponseDto, application, {
      excludeExtraneousValues: true,
    })
  }

  async findAll(page: number = Pages.Pages, limit: number = Pages.Limit) {
    const [applications, total] = await this.apliRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        vacancyId: true,
        applicantId: true,
      }
    });

    if (!applications) throw new NotFoundException("Postualciones no encontrados");

    const transformedApplications = plainToInstance(ApplicationResponseDto, applications, {
      excludeExtraneousValues: true,
    });

    const meta = { total, page, limit };

    return { transformedApplications, meta };
  }

  async findOne(id: string) {
    let foundApplication: Application | null = await this.apliRepository.findOne({
      where: { id: id },
      relations: {
        vacancyId: true,
        applicantId: true,
      }
    });

    if (!foundApplication) throw new BadRequestException('Postulacion no encontrada')

    const transformedApplication = plainToInstance(ApplicationResponseDto, foundApplication, {
      excludeExtraneousValues: true,
    })

    return transformedApplication;
  }

  async softDelete(id: string) {
    const foundApplication: Application | null = await this.apliRepository.findOneBy({ id });

    if (!foundApplication) throw new NotFoundException('Vacante no encontrado');

    return await this.apliRepository.softDelete(id)
  }

  async findByUser(userId: string) {
    const applications = await this.apliRepository.find({
      where: {
        applicantId: {
          id: userId,
        },
      },
      relations: {
        vacancyId: true,
      },
      order: {
        applicationDate: 'DESC',
      },
    });

    return applications;
  }
}
