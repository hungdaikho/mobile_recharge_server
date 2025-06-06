import { Controller, Post, Body, Get, Query, UseGuards, Headers, RawBodyRequest, Req, Put, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateBulkTransactionDto } from './dto/create-bulk-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { Request } from 'express';
/**
 * Tạo giao dịch nạp tiền
 * - Nhận thông tin giao dịch từ frontend
 * - Gọi telco API (mock)
 * - Cập nhật trạng thái giao dịch
 * - Ghi log vào ActivityLog
 * - Trả về kết quả giao dịch
 */

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({ summary: 'Tạo giao dịch nạp tiền' })
  @ApiBody({ type: CreateTransactionDto })
  @Post()
  async create(@Body() dto: CreateTransactionDto) {
    // Loại bỏ status nếu undefined để tránh lỗi Prisma
    const transaction = await this.transactionsService.createTransaction({
      ...dto,
      status: dto.status || 'PENDING' // Set default status if not provided
    });
    return transaction;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách giao dịch (admin)' })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'operator', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'order', required: false })
  @Get()
  async getList(
    @Query('date') date?: string,
    @Query('country') country?: string,
    @Query('status') status?: string,
    @Query('operator') operator?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('sort') sort: string = 'createdAt',
    @Query('order') order: 'asc' | 'desc' = 'desc',
  ) {
    return this.transactionsService.getTransactions({ date, country, status, operator, page, limit, sort, order });
  }

  @ApiOperation({ summary: 'Tạo giao dịch nạp tiền hàng loạt qua Stripe' })
  @ApiBody({ type: CreateBulkTransactionDto })
  @Post('stripe/create-payment')
  async createStripePayment(@Body() dto: CreateBulkTransactionDto) {
    return this.transactionsService.createBulkTransactionWithStripe(dto);
  }

  @ApiOperation({ summary: 'Webhook nhận kết quả thanh toán từ Stripe' })
  @ApiHeader({ name: 'stripe-signature', required: true })
  @Post('stripe/webhook')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>
  ) {
    const payload = request.rawBody;
    
    if (!payload) {
      throw new Error('No payload received');
    }

    try {
      const event = await this.transactionsService.constructWebhookEvent(
        payload,
        signature
      );
      
      await this.transactionsService.handleStripeWebhook(event);
      return { received: true };
    } catch (err) {
      console.error('Webhook Error:', err.message);
      throw new Error(`Webhook Error: ${err.message}`);
    }
  }
  @ApiOperation({ 
    summary: 'Cập nhật trạng thái giao dịch',
    description: 'Cập nhật trạng thái của một giao dịch theo ID. Các trạng thái có thể sử dụng: PENDING, SUCCESS, FAILED, REFUNDED'
  })
  @ApiBody({ 
    type: UpdateTransactionDto,
    description: 'Dữ liệu cập nhật trạng thái giao dịch'
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto
  ) {
    return this.transactionsService.updateTransaction(id, dto);
  }
}
