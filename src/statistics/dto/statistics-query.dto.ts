import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export enum GroupBy {
  DAY = 'day',
  MONTH = 'month',
  YEAR = 'year',
}

export class StatisticsQueryDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  operator?: string;

  @IsOptional()
  @IsEnum(GroupBy)
  groupBy?: GroupBy = GroupBy.DAY;
} 