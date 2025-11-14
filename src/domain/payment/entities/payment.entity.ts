// src/payments/entities/payment.entity.ts
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Index,
    PrimaryColumn,
} from 'typeorm';


export enum PaymentMethod {
    CASH = 'CASH',
    CARD = 'CARD',
    TRANSFER = 'TRANSFER',
    MP = 'MERCADOPAGO',
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    FAILURE = 'FAILURE',

}

@Entity({ name: 'payments' })
export class PaymentEntity {

    @PrimaryColumn({ type: 'varchar', length: 64 })
    id: string;

    //@ManyToOne(() => Payer, (p) => p.payments, { onDelete: 'RESTRICT' })
    //@JoinColumn({ name: 'payerId' })
    //payer: Payer;


    @Column({
        type: 'numeric',
        precision: 12,
        scale: 2,
    })
    amount: number;

    @Column({
        type: 'enum',
        enum: PaymentMethod,
    })
    paymentMethod: PaymentMethod;


    @Column({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
    })
    transactionStatus: TransactionStatus;

    @Column({
        name: 'dateTime',
        type: 'timestamptz',
        default: () => 'now()',
    })
    dateTime: Date;

    @Column({ type: 'varchar', length: 500, nullable: true })
    description?: string;
}

