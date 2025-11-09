import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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
  @Get('create-donation')
  async createDonation(@Body() dto: CreatePaymentDto) {
    return await this.paymentService.createDonacion(dto);
  }

  // pago con exito
  @Get('/success')
  success(@Param('id') id: string) {
    //return this.paymentService.findOne(+id);
  }

    // pago sin exito
  @Get('/success')
  failure(@Param('id') id: string) {
    //return this.paymentService.findOne(+id);
  }
    // pago pendiente
  @Get('/success')
  pending(@Param('id') id: string) {
    //return this.paymentService.findOne(+id);
  }

  @Get('/webhook')
  webhook(@Param('id') id: string) {
    //return this.paymentService.findOne(+id);
  }


  
}
