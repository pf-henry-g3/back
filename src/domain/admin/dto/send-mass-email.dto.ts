import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMassEmailDto {
  @ApiProperty({
    example: 'Nueva actualización importante',
    description: 'Asunto del email',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    example: 'Estimados usuarios, les informamos sobre...',
    description: 'Cuerpo del mensaje del email',
  })
  @IsString()
  @IsNotEmpty()
  body: string;
}

