import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: '0986001234' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: 'VN' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 'VIETTEL' })
  @IsString()
  @IsNotEmpty()
  operator: string;

  @ApiProperty({ example: '10000' })
  @IsNotEmpty()
  amount: string;

  @ApiProperty({ example: 'VND', enum: ['VND', 'USD', 'EUR'] })
  @IsString()
  @IsNotEmpty()
  currency: string;
} 