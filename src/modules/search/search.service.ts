import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { Band } from '../band/entities/band.entity';
import { Vacancy } from '../vacancy/entities/vacancy.entity';
import { GlobalSearchResult } from './dto/globalSearchResult.dto';
import { Pages } from 'src/enums/pages.enum';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Band)
    private bandsRepository: Repository<Band>,

    @InjectRepository(Vacancy)
    private vacacniesRepository: Repository<Vacancy>,
  ) { }
  async globalSearch(query: string, page: number = Pages.Pages, limit: number = Pages.Limit) {
    //Guardamos el string en la estructura de consulta
    const searchPattern = `%${query}%`;

    const [userResult, bandResult, vacancyResult] = await Promise.all([
      this.usersRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        where: [
          { userName: ILike(searchPattern), },
          { aboutMe: ILike(searchPattern) }
        ],
        select: ['id', 'userName', 'urlImage', 'aboutMe', 'city', 'country', 'birthDate', 'averageRating'],
      }),
      this.bandsRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        where: [
          { bandName: ILike(searchPattern), },
          { bandDescription: ILike(searchPattern) }
        ],
        select: ['id', 'bandName', 'urlImage', 'bandDescription', 'formationDate', 'leader'],
      }),
      this.vacacniesRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        where: { name: ILike(searchPattern) },
        select: ['id', 'name', 'urlImage', 'vacancyDescription', 'owner', 'isOpen'],
      }),
    ]);

    const [users, totalUsers] = userResult;
    const [bands, totalBands] = bandResult;
    const [vacancies, totalVacancies] = vacancyResult;

    const mappedUsers: GlobalSearchResult[] = users.map(user => ({
      id: user.id,
      name: user.userName,
      type: 'user',
      urlImage: user.urlImage,
      birthDate: user.birthDate,
      description: user.aboutMe,
      averageRating: user.averageRating,
      city: user.city,
      country: user.country,
    }))

    const mappedBands: GlobalSearchResult[] = bands.map(band => ({
      id: band.id,
      name: band.bandName,
      type: 'band',
      urlImage: band.urlImage,
      description: band.bandDescription,
      formationDate: band.formationDate,
      leaderId: band.leader.id,
    }))

    const mappedVacancies: GlobalSearchResult[] = vacancies.map(vacancy => ({
      id: vacancy.id,
      name: vacancy.name,
      type: 'vacancy',
      urlImage: vacancy.urlImage,
      description: vacancy.vacancyDescription,
      ownerId: vacancy.owner.id,
      isOpen: vacancy.isOpen
    }))

    //Devolver una lista unificada y el total con paginacion y limite
    const total = totalUsers + totalBands + totalVacancies;

    return {
      meta: {
        total,
        page,
        limit,
      },
      data: [...mappedBands, ...mappedVacancies, ...mappedUsers],
    }
  }

}
