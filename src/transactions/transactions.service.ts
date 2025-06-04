import { Injectable, OnModuleInit, Logger, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBulkTransactionDto, TopupItem, SupportedCurrency } from './dto/create-bulk-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UnsupportedCurrencyException, AmountLimitExceededException, StripeCredentialNotFoundException, TransactionException } from './exceptions/transaction.exception';
import Stripe from 'stripe';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService implements OnModuleInit {
  private stripe: Stripe | undefined;
  private readonly logger = new Logger(TransactionsService.name);

  // Currency configuration
  private readonly CURRENCY_CONFIG = {
    [SupportedCurrency.VND]: {
      maxAmount: 50000000, // 50M VND
      stripeMultiplier: 1, // VND doesn't use decimal
      symbol: '₫'
    },
    [SupportedCurrency.USD]: {
      maxAmount: 500, // $500
      stripeMultiplier: 100, // cents
      symbol: '$'
    },
    [SupportedCurrency.EUR]: {
      maxAmount: 450, // €450
      stripeMultiplier: 100, // cents
      symbol: '€'
    }
  };

  constructor(private readonly prismaService: PrismaService) {}

  async onModuleInit() {
    try {
      // Initialize stripe if credentials exist
      const stripeCredential = await this.prismaService.apiCredential.findFirst({
        where: {
          name: 'Stripe',
          type: 'PAYMENT',
          isActive: true
        }
      });

      if (!stripeCredential) {
        this.logger.warn('Stripe credentials not found or inactive');
        return;
      }

      if (!stripeCredential.apiSecret) {
        this.logger.error('Stripe API secret is empty');
        return;
      }

      this.stripe = new Stripe(stripeCredential.apiSecret, {
        apiVersion: '2025-05-28.basil'
      });

      // Verify Stripe connection
      await this.stripe.balance.retrieve();
      this.logger.log('Stripe initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Stripe:', error);
      this.stripe = undefined;
    }
  }

  private async mockTelcoApi(phoneNumber: string): Promise<'success' | 'failed'> {
    // Simulate API call with 80% success rate
    return Math.random() > 0.2 ? 'success' : 'failed';
  }

  private async handleTopupFailure(paymentIntentId: string, phoneNumber: string, amount: number) {
    try {
      if (!this.stripe) {
        throw new StripeCredentialNotFoundException();
      }
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
    // Check if Stripe is initialized
    if (!this.stripe) {
      throw new StripeCredentialNotFoundException();
    }

    // Validate total amount
    const totalAmount = dto.topups.reduce((sum, item) => sum + item.amount, 0);
    
    // Get currency configuration
    const currencyConfig = this.CURRENCY_CONFIG[dto.currency];
    if (!currencyConfig) {
      throw new UnsupportedCurrencyException(dto.currency);
    }
    
    if (totalAmount > currencyConfig.maxAmount) {
      throw new AmountLimitExceededException(
        totalAmount, 
        currencyConfig.maxAmount, 
        `${currencyConfig.symbol}${dto.currency}`
      );
    }

    try {
      // Convert amount to smallest currency unit for Stripe
      const stripeAmount = totalAmount * currencyConfig.stripeMultiplier;

      // Create payment intent with Stripe
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: stripeAmount,
        currency: dto.currency.toLowerCase(),
        payment_method_types: ['card'],
        metadata: {
          type: 'BULK_TOPUP',
          phoneNumbers: dto.topups.map(t => t.phoneNumber).join(','),
          amounts: dto.topups.map(t => t.amount).join(',')
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
      if (error instanceof TransactionException) {
        throw error;
      }
      this.logger.error('Error creating bulk transaction:', error);
      throw new TransactionException('Failed to create transaction', HttpStatus.INTERNAL_SERVER_ERROR);
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
          // Attempt to perform topup
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
    if (!this.stripe) {
      throw new StripeCredentialNotFoundException();
    }
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

  async createTransaction(data: CreateTransactionDto) {
    try {
      // 1. Tạo transaction với status pending nếu chưa có
      const transaction = await this.prismaService.transaction.create({ 
        data: { 
          phoneNumber: data.phoneNumber,
          country: data.country,
          operator: data.operator,
          amount: data.amount,
          currency: data.currency,
          status: data.status || 'PENDING',
          type: 'TOPUP',
          paymentMethod: data.paymentMethod || 'DIRECT',
        } 
      });

      // 2. Gọi telco API (mock)
      const telcoResult = await this.mockTelcoApi(data.phoneNumber);

      // 3. Cập nhật status
      const updated = await this.prismaService.transaction.update({
        where: { id: transaction.id },
        data: { status: telcoResult },
      });

      // 4. Ghi log
      await this.prismaService.activityLog.create({
        data: {
          phoneNumber: transaction.phoneNumber,
          action: 'TOPUP',
          metadata: { 
            transactionId: transaction.id, 
            status: telcoResult 
          }
        }
      });

      // 5. Trả về transaction đã cập nhật
      return updated;
    } catch (error) {
      this.logger.error('Error creating transaction:', error);
      throw error;
    }
  }

  async getTransactions({ date, country, status, operator, page = 1, limit = 20, sort = 'createdAt', order = 'desc' }: any) {
    try {
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
        this.prismaService.transaction.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [sort]: order },
        }),
        this.prismaService.transaction.count({ where }),
      ]);

      return { items, total, page, limit };
    } catch (error) {
      this.logger.error('Error getting transactions:', error);
      throw error;
    }
  }

  async updateTransaction(id: string, data: UpdateTransactionDto) {
    try {
      // Check if transaction exists
      const transaction = await this.prismaService.transaction.findUnique({
        where: { id }
      });

      if (!transaction) {
        throw new TransactionException('Transaction not found', HttpStatus.NOT_FOUND);
      }

      // Update transaction status
      const updated = await this.prismaService.transaction.update({
        where: { id },
        data: {
          status: data.status
        }
      });

      // Log the update
      await this.prismaService.activityLog.create({
        data: {
          phoneNumber: transaction.phoneNumber,
          action: 'UPDATE_TRANSACTION_STATUS',
          metadata: {
            transactionId: id,
            oldStatus: transaction.status,
            newStatus: data.status
          }
        }
      });

      return updated;
    } catch (error) {
      this.logger.error(`Error updating transaction ${id}:`, error);
      throw error;
    }
  }
}
