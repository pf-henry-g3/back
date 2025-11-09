import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import mercadopago, { MercadoPagoConfig, Payment, Preference } from "mercadopago"
import { PaymentEntity, PaymentMethod, TransactionStatus } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PaymentService {
  private mp = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
  ) { }

  async createDonacion(dto: CreatePaymentDto) {
    const preference = new Preference(this.mp);

    const res = await preference.create({
      body: {
        items: [
          {
            id: 'donation-100-ARS',
            title: 'donacion',
            unit_price: dto.amount,
            quantity: 1,
            currency_id: 'ARS',
          },
        ],
        back_urls: {
          success: `${process.env.FRONTEND_URL}/home`,
          failure: `${process.env.FRONTEND_URL}/failure`,
          pending: `${process.env.FRONTEND_URL}/home`

        },
        auto_return: undefined,
        notification_url: `${process.env.FRONTEND_URL}/webhook`
      },

    });
    await this.paymentRepo.save({
      id: res.id,
      amount: dto.amount,
      paymentMethod: PaymentMethod.MP,
      transactionStatus: TransactionStatus.PENDING,
      description: `Donación - pref:${res.id}`,
    });
    return res.init_point
  }

  async reciveWebhook() {

  }

  async getAll() {
    return await this.paymentRepo.find()
  }

}
