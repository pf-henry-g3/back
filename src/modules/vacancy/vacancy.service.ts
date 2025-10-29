import { Injectable } from '@nestjs/common';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import vacancysData from '../../data/vacancy.data.json';
import { InjectRepository } from '@nestjs/typeorm';
import { Vacancy } from './entities/vacancy.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import e from 'express';
import { Band } from '../band/entities/band.entity';

@Injectable()
export class VacancyService {
  constructor(
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Band)
    private readonly bandsRepository: Repository<Band>,
  ) { }


  create(createVacancyDto: CreateVacancyDto) {
    return 'This action adds a new vacancy';
  }

  findAll() {
    return `This action returns all vacancy`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vacancy`;
  }

  update(id: number, updateVacancyDto: UpdateVacancyDto) {
    return `This action updates a #${id} vacancy`;
  }

  remove(id: number) {
    return `This action removes a #${id} vacancy`;
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
      newVacancy.ownerId = user;
      await this.vacancyRepository.save(newVacancy);
      console.log(`✅ Vacante ${vacancyData.name} creada.`);
    }
    console.log('🎉 Precarga de vacantes completada.');
  }
}
