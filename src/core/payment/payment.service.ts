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


    const externalReference = Date.now().toString();


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
          pending: `${process.env.FRONTEND_URL}/home`,
        },
        // auto_return: 'approved',
        notification_url: `${process.env.FRONTEND_URL}/webhook`,


        external_reference: externalReference,
      },
    });

    await this.paymentRepo.save({
      id: externalReference,
      amount: dto.amount,
      paymentMethod: PaymentMethod.MP,
      transactionStatus: TransactionStatus.PENDING,
      description: `Donación - pref:${res.id}`,
    });

    return res.init_point;
  }

  async reciveWebhook(payload: any) {
    if ((payload?.type || payload?.topic) !== 'payment') return true;

    const paymentId = String(payload?.data?.id || payload?.id || '');
    if (!paymentId) return true;

    const mpPayment = await new Payment(this.mp).get({ id: paymentId });

    const prefId = mpPayment?.external_reference;
    if (!prefId) return true;

    const current = await this.paymentRepo.findOne({ where: { id: prefId } });
    if (!current) return true;
    if (current.transactionStatus === TransactionStatus.APPROVED) return true;

    const s = String(mpPayment?.status || '').toLowerCase();

    if (s === 'approved') {
      await this.paymentRepo.update(
        { id: prefId },
        {
          transactionStatus: TransactionStatus.APPROVED,
          description: `Donación - pref:${prefId} - pay:${paymentId}`,
        },
      );
      return true;
    }

    if (['rejected', 'cancelled', 'canceled', 'refunded', 'charged_back'].includes(s)) {
      await this.paymentRepo.update(
        { id: prefId },
        {
          transactionStatus: TransactionStatus.FAILURE,
          description: `Donación - pref:${prefId} - pay:${paymentId} - ${s}`,
        },
      );
      return true;
    }

    return true;
  }

  async getAll() {
    return await this.paymentRepo.find()
  }

}
