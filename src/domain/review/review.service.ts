import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { User } from '../user/entities/user.entity';
import { AbstractFileUploadService } from 'src/core/file-upload/file-upload.abstract.service';
import { Review } from './entities/review.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUploadService } from 'src/core/file-upload/file-upload.service';
import { CreateBandDto } from '../band/dto/create-band.dto';
import { plainToInstance } from 'class-transformer';
import { ReviewResponseDto } from './dto/review-response.dto';
import { Pages } from 'src/common/enums/pages.enum';

@Injectable()
export class ReviewService extends AbstractFileUploadService<Review> { //Extiende al metodo abstracto de subida de archivos
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,

    fileUploadService: FileUploadService,
  ) { super(fileUploadService, reviewsRepository) }

  async create(createReviewDto: CreateReviewDto, owner: User) {
    const userReciever: User | null = await this.usersRepository.findOneBy({ userName: createReviewDto.receptorUserName });

    if (!userReciever) throw new NotFoundException('Usuario receptor no encontrado.');
    if (owner.id === userReciever.id) throw new BadRequestException('No podes dejar una review a vos mismo');

    const newReview: Review = this.reviewsRepository.create({
      ...createReviewDto,
      date: new Date(),
      owner,
      receptor: userReciever,
    });

    await this.reviewsRepository.save(newReview);

    const tranformedReview = plainToInstance(ReviewResponseDto, newReview, {
      excludeExtraneousValues: true,
    });

    return tranformedReview;
  }

  async findAllByUserRole(
    role: 'owner' | 'receptor',
    user: User,
    page: number = Pages.Pages,
    limit: number = Pages.Limit,
  ) {
    const [reviews, total] = await this.reviewsRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      where: { [role]: user },
      relations: {
        owner: true,
        receptor: true,
      },
    });

    const tranformedReviews = plainToInstance(ReviewResponseDto, reviews, {
      excludeExtraneousValues: true,
    });

    const meta = { total, page, limit };
    return { tranformedReviews, meta };
  }

  async update(id: string, updateReviewDto: UpdateReviewDto) {
    const foundReview: Review | null = await this.reviewsRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        receptor: true,
      }
    });

    if (!foundReview) throw new NotFoundException('Review no encontradas');

    const updatedReview = Object.assign(foundReview, updateReviewDto);

    await this.reviewsRepository.save(updateReviewDto);

    const transformedReview = plainToInstance(ReviewResponseDto, updatedReview, {
      excludeExtraneousValues: true,
    });

    return transformedReview;
  }

  async updateProfilePicture(file: Express.Multer.File, id: string) {
    const review: Review | null = await this.reviewsRepository.findOneBy({ id });

    if (!review) {
      throw new NotFoundException('Review no encontrada');
    }

    return this.uploadImage(file, id);
  }

  async softDelete(id: string) {
    const review = await this.reviewsRepository.findOneBy({ id });

    if (!review) throw new NotFoundException('Review no encontrada');

    await this.reviewsRepository.softDelete(id);

    return `Review ${id} eliminada con exito`;
  }
}
