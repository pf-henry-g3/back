import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vacancy } from '../vacancy/entities/vacancy.entity';
import { Application } from './entities/application.entity';

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

  async create(createApplicationDto: CreateApplicationDto) {
  const { vacancyId, applicantId, applicationDescription } = createApplicationDto;

    
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
      throw new BadRequestException('postulacion no encontrada');
    }


    const existingApplication = await this.apliRepository.findOne({
      where: {
        vacancyId: { id: vacancyId },
        applicantId: { id: applicantId },
      },
    });

    if (existingApplication) {
      throw new BadRequestException(
        'el usuario ya aplico',
      );
    }
    const application = this.apliRepository.create({
      vacancyId: vacancy,
      applicantId: applicant,
      applicationDescription,
      applicationDate: new Date(),  
    });

    return await this.apliRepository.save(application);
  }

  findAll() {
    return `This action returns all application`;
  }

  findOne(id: number) {
    return `This action returns a #${id} application`;
  }

  update(id: number, updateApplicationDto: UpdateApplicationDto) {
    return `This action updates a #${id} application`;
  }

  remove(id: number) {
    return `This action removes a #${id} application`;
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
