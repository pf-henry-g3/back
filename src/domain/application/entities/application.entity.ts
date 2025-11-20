import { User } from "src/domain/user/entities/user.entity";
import { Vacancy } from "src/domain/vacancy/entities/vacancy.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vacancy, (vacancy) => vacancy.applications, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vacancyId' })
  vacancyId: Vacancy;

  @ManyToOne(() => User, (user) => user.applicationsAsApplicant, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'applicantId' })
  applicantId: User;

  @Column({ type: 'timestamptz' })
  applicationDate: Date;

  @Column({ type: 'text', nullable: true })
  applicationDescription: string;

  @Column({ length: 50, default: 'PENDING' })
  status: string;

  @DeleteDateColumn({
    nullable: true,
  })
  deletedAt: Date | null;
}
