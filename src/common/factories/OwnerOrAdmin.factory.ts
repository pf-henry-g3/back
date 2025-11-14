import { Band } from 'src/domain/band/entities/band.entity';
import { Vacancy } from 'src/domain/vacancy/entities/vacancy.entity';
import { OwnerOrAdminGuard } from '../guards/OwnerOrAdmin.guard';
import { Review } from 'src/domain/review/entities/review.entity';

export const BandOwnerGuard = () => OwnerOrAdminGuard(Band, 'leader');
export const VacancyOwnerGuard = () => OwnerOrAdminGuard(Vacancy, 'owner');
export const ReviewOwnerGuard = () => OwnerOrAdminGuard(Review, 'owner');
