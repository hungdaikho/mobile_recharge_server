import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateTransactionDto {
  @ApiProperty({
    description: 'Trạng thái mới của giao dịch',
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
    example: 'SUCCESS'
  })
  @IsString()
  status: string;
} 