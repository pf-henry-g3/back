import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { Vacancy } from '../vacancy/entities/vacancy.entity';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,

    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}
 async  create(createApplicationDto: CreateApplicationDto) {
    const { vacancyId, applicantId, applicationDescription } = createApplicationDto;

   
    const vacancy = await this.vacancyRepository.findOne({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      throw new BadRequestException('vancante no enontrada');
    }

   
    const applicant = await this.userRepo.findOne({
      where: { id: applicantId },
    });

    if (!applicant) {
      throw new BadRequestException('user no encontrado');
    }

    
    const existingApplication = await this.applicationRepo.findOne({
      where: {
        vacancyId: { id: vacancyId },
        applicantId: { id: applicantId },
      },
    });

    if (existingApplication) {
      throw new BadRequestException(
        'usuario ya esta postulado',
      );
    }

    const application = this.applicationRepo.create({
      vacancyId: vacancy,
      applicantId: applicant,
      applicationDescription,
      applicationDate: new Date(),    
    });

   
    return await this.applicationRepo.save(application);
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
}
