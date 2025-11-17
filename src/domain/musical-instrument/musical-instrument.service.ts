import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMusicalInstrumentDto } from './dto/create-musical-instrument.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MusicalInstrument } from './entities/musical-instrument.entity';
import { ILike, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { MusicalInstrumentResponseDto } from 'src/common/dto/musical-instrument-response.dto';
import { Pages } from 'src/common/enums/pages.enum';

@Injectable()
export class MusicalInstrumentService {
  constructor(
    @InjectRepository(MusicalInstrument)
    private readonly instrumentsRepository: Repository<MusicalInstrument>
  ) { }

  async create(createMusicalInstrumentDto: CreateMusicalInstrumentDto) {
    const foundInstrument: MusicalInstrument | null = await this.instrumentsRepository.findOne({
      where: {
        name: ILike(`%${createMusicalInstrumentDto.name}%`),
      }
    });

    if (foundInstrument) throw new BadRequestException('El instrumento ya existe');

    const newInstrument: MusicalInstrument = this.instrumentsRepository.create({ ...createMusicalInstrumentDto })

    await this.instrumentsRepository.save(newInstrument);

    const transformedInstrument = plainToInstance(MusicalInstrumentResponseDto, newInstrument, {
      excludeExtraneousValues: true,
    });

    return transformedInstrument;
  }

  async findAll(page: number = Pages.Pages, limit: number = Pages.Limit) {
    let [instruments, total] = await this.instrumentsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    if (!instruments) throw new NotFoundException("Instrumentos no encontrados");

    const transformedInstruments = plainToInstance(MusicalInstrumentResponseDto, instruments, {
      excludeExtraneousValues: true,
    })

    const meta = { total, page, limit };
    return { transformedInstruments, meta }
  }

  async findInstrumentsByName(instrumentName: string, page: number = Pages.Pages, limit: number = Pages.Limit) {
    const [instruments, total] = await this.instrumentsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        name: ILike(`%${instrumentName}%`),
      },
    })

    if (!instruments) throw new NotFoundException("Instrumentos no encontrados");

    const transformedInstruments = plainToInstance(MusicalInstrumentResponseDto, instruments, {
      excludeExtraneousValues: true,
    })

    const meta = { total, page, limit };

    return { transformedInstruments, meta }
  }
}
