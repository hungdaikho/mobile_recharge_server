import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient, Transaction, ActivityLog } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBulkTransactionDto, TopupItem, SupportedCurrency } from './dto/create-bulk-transaction.dto';
import Stripe from 'stripe';

@Injectable()
export class TransactionsService implements OnModuleInit {
  private prisma = new PrismaClient();
  private stripe: Stripe;
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private prismaService: PrismaService
  ) {}

  async onModuleInit() {
    // Get Stripe credentials from database when module initializes
    const stripeCredential = await this.prismaService.apiCredential.findFirst({
      where: {
        name: 'Stripe',
        type: 'PAYMENT',
        isActive: true
      }
    });

    if (!stripeCredential) {
      throw new Error('Stripe credentials not found in database');
    }

    this.stripe = new Stripe(stripeCredential.apiSecret, {
      apiVersion: '2025-05-28.basil'
    });
  }

  private async mockTelcoApi(phoneNumber: string): Promise<'success' | 'failed'> {
    // Simulate API call with 80% success rate
    return Math.random() > 0.2 ? 'success' : 'failed';
  }

  private async logActivity(phoneNumber: string, action: string, metadata: any): Promise<ActivityLog> {
    return this.prisma.activityLog.create({
      data: {
        phoneNumber,
        action,
        metadata,
      },
    });
  }

  async createTransaction(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & { status?: string }): Promise<Transaction> {
    // 1. Tạo transaction với status pending nếu chưa có
    const transaction = await this.prisma.transaction.create({ data: { ...data, status: data.status || 'pending' } });
    // 2. Gọi telco API (mock)
    const telcoResult = await this.mockTelcoApi(data.phoneNumber);
    // 3. Cập nhật status
    const updated = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: telcoResult },
    });
    // 4. Ghi log
    await this.logActivity(transaction.phoneNumber, 'topup', { transactionId: transaction.id, status: telcoResult });
    // 5. Trả về transaction đã cập nhật
    return updated;
  }

  async getTransactions({ date, country, status, operator, page = 1, limit = 20, sort = 'createdAt', order = 'desc' }: any) {
    const where: any = {};
    if (date) {
      const d = new Date(date);
      where.createdAt = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lt: new Date(d.setHours(24, 0, 0, 0)),
      };
    }
    if (country) where.country = country;
    if (status) where.status = status;
    if (operator) where.operator = operator;
    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort]: order },
      }),
      this.prisma.transaction.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  private async handleTopupFailure(paymentIntentId: string, phoneNumber: string, amount: number) {
    try {
      // Create refund
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount
      });

      // Log refund
      await this.prismaService.activityLog.create({
        data: {
          phoneNumber,
          action: 'REFUND_INITIATED',
          metadata: {
            paymentIntentId,
            refundId: refund.id,
            amount
          }
        }
      });

      // Update transaction status
      await this.prismaService.transaction.updateMany({
        where: {
          phoneNumber,
          status: 'SUCCESS'
        },
        data: {
          status: 'REFUNDED'
        }
      });

      return refund;
    } catch (error) {
      this.logger.error(`Failed to process refund for ${phoneNumber}:`, error);
      throw error;
    }
  }

  async createBulkTransactionWithStripe(dto: CreateBulkTransactionDto) {
    // Validate total amount
    const totalAmount = dto.topups.reduce((sum, item) => sum + item.amount, 0);
    const MAX_TOTAL_AMOUNT = dto.currency === SupportedCurrency.VND ? 50000000 : 500; // 50M VND or $500 USD
    
    if (totalAmount > MAX_TOTAL_AMOUNT) {
      throw new Error(`Total amount exceeds maximum limit of ${MAX_TOTAL_AMOUNT} ${dto.currency}`);
    }

    try {
      // Get latest Stripe credentials
      const stripeCredential = await this.prismaService.apiCredential.findFirst({
        where: {
          name: 'Stripe',
          type: 'PAYMENT',
          isActive: true
        }
      });

      if (!stripeCredential) {
        throw new Error('Stripe credentials not found or inactive');
      }

      // Create payment intent with Stripe
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: totalAmount,
        currency: dto.currency.toLowerCase(),
        payment_method_types: ['card'],
        metadata: {
          type: 'BULK_TOPUP',
          phoneNumbers: dto.topups.map(t => t.phoneNumber).join(','),
          amounts: dto.topups.map(t => t.amount).join(',') // Store individual amounts for refund
        }
      });

      // Create pending transactions in database
      const transactions = await Promise.all(
        dto.topups.map(async (topup: TopupItem) => {
          return this.prismaService.transaction.create({
            data: {
              phoneNumber: topup.phoneNumber,
              country: dto.country,
              operator: dto.operator,
              amount: topup.amount,
              currency: dto.currency,
              status: 'PENDING',
              type: 'TOPUP',
              paymentMethod: 'STRIPE',
            }
          });
        })
      );

      // Create activity logs
      await Promise.all(
        transactions.map(async (tx) => {
          return this.prismaService.activityLog.create({
            data: {
              phoneNumber: tx.phoneNumber,
              action: 'CREATE_TRANSACTION',
              metadata: {
                transactionId: tx.id,
                paymentIntentId: paymentIntent.id,
                amount: tx.amount,
                currency: tx.currency
              }
            }
          });
        })
      );

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        transactions: transactions
      };
    } catch (error) {
      this.logger.error('Error creating bulk transaction:', error);
      throw error;
    }
  }

  async handleStripeWebhook(event: Stripe.Event) {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Get phone numbers and amounts from metadata
      const phoneNumbers = paymentIntent.metadata.phoneNumbers.split(',');
      const amounts = paymentIntent.metadata.amounts.split(',').map(Number);

      // Update all related transactions to SUCCESS
      await this.prismaService.transaction.updateMany({
        where: {
          phoneNumber: {
            in: phoneNumbers
          },
          status: 'PENDING'
        },
        data: {
          status: 'SUCCESS'
        }
      });

      // Process each topup
      for (let i = 0; i < phoneNumbers.length; i++) {
        const phoneNumber = phoneNumbers[i];
        const amount = amounts[i];

        try {
          // Attempt to perform topup (mock for now)
          const topupResult = await this.mockTelcoApi(phoneNumber);
          
          if (topupResult === 'failed') {
            // If topup fails, initiate refund
            await this.handleTopupFailure(paymentIntent.id, phoneNumber, amount);
          } else {
            // Log success
            await this.prismaService.activityLog.create({
              data: {
                phoneNumber,
                action: 'TOPUP_SUCCESS',
                metadata: {
                  paymentIntentId: paymentIntent.id,
                  amount
                }
              }
            });
          }
        } catch (error) {
          this.logger.error(`Failed to process topup for ${phoneNumber}:`, error);
          // Attempt refund on error
          await this.handleTopupFailure(paymentIntent.id, phoneNumber, amount);
        }
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const phoneNumbers = paymentIntent.metadata.phoneNumbers.split(',');

      // Update transactions to FAILED
      await this.prismaService.transaction.updateMany({
        where: {
          phoneNumber: {
            in: phoneNumbers
          },
          status: 'PENDING'
        },
        data: {
          status: 'FAILED'
        }
      });

      // Log the failure
      for (const phoneNumber of phoneNumbers) {
        await this.prismaService.activityLog.create({
          data: {
            phoneNumber,
            action: 'PAYMENT_FAILED',
            metadata: {
              paymentIntentId: paymentIntent.id,
              error: paymentIntent.last_payment_error?.message
            }
          }
        });
      }
    }
  }

  // Helper method to construct Stripe webhook event
  async constructWebhookEvent(payload: string | Buffer, signature: string) {
    const stripeCredential = await this.prismaService.apiCredential.findFirst({
      where: {
        name: 'Stripe',
        type: 'PAYMENT',
        isActive: true
      }
    });

    if (!stripeCredential) {
      throw new Error('Stripe credentials not found or inactive');
    }

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      stripeCredential.apiSecret
    );
  }
}
