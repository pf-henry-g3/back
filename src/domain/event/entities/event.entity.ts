import { User } from "src/domain/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Event {
@PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.events, { nullable: false })
  @JoinColumn({ name: 'ownerId' })
  owner: User

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz' })
  endDate: Date;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  country: string;

  @Column({ length: 255 })
  address: string;

  @Column({ type: 'double precision' })
  latitude: number;

  @Column({ type: 'double precision' })
  longitude: number;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text' })
  eventDescription: string;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
