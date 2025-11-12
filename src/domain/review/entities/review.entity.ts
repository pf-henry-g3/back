import { User } from "src/domain/user/entities/user.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    //Relacion con usuario que hace la review
    @ManyToOne(() => User, (user) => user.reviewsGiven, {
        nullable: false,
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'ownerId' })
    owner: User;

    //Relacion con usuario que recibe la review
    @ManyToOne(() => User, (user) => user.reviewsReceived, {
        nullable: false,
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'receptorId' })
    receptor: User;

    @Column({
        type: 'date',
        nullable: false,
    })
    date: Date;

    @Column({
        type: 'decimal',
        precision: 2,
        scale: 1,
        default: 0.0,
        nullable: true
    })
    score: number;

    @Column({
        type: "text",
        nullable: true
    })
    reviewDescription: string;

    @Column({
        type: 'text',
        default: 'https://res.cloudinary.com/dgxzi3eu0/image/upload/v1762349274/LOGO_cs74ae.png',
    })
    urlImage: string;

    //Borrado logico
    @DeleteDateColumn({
        nullable: true,
    })
    deleteAt: Date | null;
}
