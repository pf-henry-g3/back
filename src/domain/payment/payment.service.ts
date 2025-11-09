import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import mercadopago, { MercadoPagoConfig, Payment, Preference } from "mercadopago"
import { PaymentEntity, PaymentMethod, TransactionStatus } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PaymentService {
  private mp = new MercadoPagoConfig({
    accessToken: "TEST-8369416514283842-110409-fdb31d3bc9dc8a824423c1db870d955f-796070948"
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
          success: "http://localhost:3000/home",
          failure: "http://localhost:3000/failure",
          pending: "http://localhost:3000/home"

        },
        auto_return: "approved",
        notification_url: "http://localhost:3000/webhook"
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

  async getAll(){
    return await this.paymentRepo.find()
  }

}
