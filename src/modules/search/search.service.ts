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

    //Definir las consultas que se ejecutaran en paralelo
    const [userQuery, total1] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: { userName: ILike(searchPattern) },
      select: ['id', 'userName', 'urlImage', 'aboutMe', 'city', 'country'],
    })

    const [bandQuery, total2] = await this.bandsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: { bandName: ILike(searchPattern) },
      select: ['id', 'bandName', 'urlImage', 'bandDescription'],
    })

    const [vacancyQuery, total3] = await this.vacacniesRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: { name: ILike(searchPattern) },
      select: ['id', 'name', 'urlImage', 'vacancyDescription'],
    })

    //consultas en paralelo
    const [users, bands, vacancies] = await Promise.all([
      userQuery,
      bandQuery,
      vacancyQuery,
    ])

    //Mapear y unir consultas

    const mappedUsers: GlobalSearchResult[] = users.map(user => ({
      id: user.id,
      name: user.userName,
      type: 'user',
      urlImage: user.urlImage,
      description: user.aboutMe,
      city: user.city,
      country: user.country,
    }))

    const mappedBands: GlobalSearchResult[] = bands.map(band => ({
      id: band.id,
      name: band.bandName,
      type: 'band',
      urlImage: band.urlImage,
      description: band.bandDescription,
    }))

    const mappedVacancies: GlobalSearchResult[] = vacancies.map(vacancy => ({
      id: vacancy.id,
      name: vacancy.name,
      type: 'vacancy',
      urlImage: vacancy.urlImage,
      description: vacancy.vacancyDescription,
      isOpen: vacancy.isOpen
    }))

    //Devolver una lista unificada y el total con paginacion y limite
    const total = total1 + total2 + total3;

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
