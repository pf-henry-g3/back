import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from 'src/core/payment/dto/create-payment.dto';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { PaymentEntity, PaymentMethod, TransactionStatus } from 'src/core/payment/entities/payment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PaymentService {
  private mp = new MercadoPagoConfig({
    accessToken: 'APP_USR-5602149800606235-111317-4bc014af7a5a6147444395cbb90f179a-2966161435',
  });

  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
  ) {}

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
          success: 'http://localhost:3000/home',
          failure: 'http://localhost:3000/failure',
          pending: 'http://localhost:3000/home',
        },
        notification_url: 'https://z44wwk4ocgc4c0ws8kkow8s8.72.61.129.102.sslip.io/webhook',
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
    return await this.paymentRepo.find();
  }
}
