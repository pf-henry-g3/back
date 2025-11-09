// src/common/guards/owner-or-admin.factory.ts
import { Band } from 'src/domain/band/entities/band.entity';
import { Vacancy } from 'src/domain/vacancy/entities/vacancy.entity';
import { OwnerOrAdminGuard } from '../guards/OwnerOrAdmin.guard';

export const BandOwnerGuard = () => OwnerOrAdminGuard(Band, 'leader');
export const VacancyOwnerGuard = () => OwnerOrAdminGuard(Vacancy, 'owner');
