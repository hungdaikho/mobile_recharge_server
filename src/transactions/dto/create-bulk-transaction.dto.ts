import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ValidateNested, IsNotEmpty, Min, Max, IsNumber, ArrayMinSize, ArrayMaxSize, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum SupportedCurrency {
  VND = 'VND',
  USD = 'USD',
  EUR = 'EUR'
}

export class TopupItem {
  @ApiProperty({ example: '0986001234' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ 
    example: 50000, 
    description: 'Amount in smallest currency unit (VND: đồng, USD/EUR: cents)' 
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(10000) // Minimum 10,000 VND or $0.1 USD or €0.1 EUR
  @Max(10000000) // Maximum 10M VND or $100 USD or €100 EUR
  amount: number;
}

export class CreateBulkTransactionDto {
  @ApiProperty({ 
    type: [TopupItem],
    description: 'Array of phone numbers and amounts to topup'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(10) // Maximum 10 numbers per transaction
  @Type(() => TopupItem)
  topups: TopupItem[];

  @ApiProperty({ example: 'VN' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 'VIETTEL' })
  @IsString()
  @IsNotEmpty()
  operator: string;

  @ApiProperty({ 
    enum: SupportedCurrency,
    example: 'VND',
    description: 'Currency for the transaction (VND, USD, EUR)'
  })
  @IsEnum(SupportedCurrency)
  @IsNotEmpty()
  currency: SupportedCurrency;
} 