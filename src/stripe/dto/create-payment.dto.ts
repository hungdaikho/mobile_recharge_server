import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

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

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @IsNotEmpty()
  @Min(10000)
  amount: number;

  @ApiProperty({ example: 'VND', enum: ['VND', 'USD', 'EUR'] })
  @IsString()
  @IsNotEmpty()
  currency: string;
} 