import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  //obtengo todos los pagos
  @Get()
  async GetAll() {
    return await this.paymentService.getAll();
  }

  //ruta creacion orden de pago - donacion
  @Post('create-donation')
  async createDonation(@Body() dto: CreatePaymentDto) {
    return await this.paymentService.createDonacion(dto);
  }

 @Post('webhook')
@HttpCode(200) 
  async mpWebhook(@Body() body: any) {
    await this.paymentService.reciveWebhook(body);
    return { ok: true };
  }


  
}
