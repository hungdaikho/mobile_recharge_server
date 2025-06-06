import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StatisticTransactionFilterDto {
  @ApiPropertyOptional({ description: 'Ngày bắt đầu, định dạng YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Ngày kết thúc, định dạng YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Mã quốc gia' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Tên nhà mạng' })
  @IsOptional()
  @IsString()
  operator?: string;

  @ApiPropertyOptional({ description: 'Trạng thái giao dịch' })
  @IsOptional()
  @IsString()
  status?: string;
} 