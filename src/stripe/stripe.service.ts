import { Injectable, OnModuleInit, Logger, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import Stripe from 'stripe';
import { TransactionException } from '../transactions/exceptions/transaction.exception';

@Injectable()
export class StripeService implements OnModuleInit {
  private stripe: Stripe | undefined;
  private readonly logger = new Logger(StripeService.name);
  private publicKey: string | undefined;

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

      // Store public key from metadata if available
      this.publicKey = stripeCredential.apiKey as string;

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

  async getPublicKey() {
    if (!this.publicKey) {
      throw new TransactionException('Stripe public key not found', HttpStatus.SERVICE_UNAVAILABLE);
    }
    return { publicKey: this.publicKey };
  }

  async createPaymentIntent(dto: CreatePaymentDto) {
    if (!this.stripe) {
      throw new TransactionException('Stripe is not initialized', HttpStatus.SERVICE_UNAVAILABLE);
    }
  
    try {
      // Tách phoneNumber và amount thành mảng nếu có nhiều giá trị
      const phoneNumbers = dto.phoneNumber.split(';');
      const amounts = dto.amount.split(';');
      
      if (phoneNumbers.length !== amounts.length) {
        throw new TransactionException('Số lượng phoneNumber và amount không khớp', HttpStatus.BAD_REQUEST);
      }

      // Tạo transaction cho từng cặp phoneNumber-amount
      const transactionIds: string[] = [];
      for (let i = 0; i < phoneNumbers.length; i++) {
        const transaction = await this.prismaService.transaction.create({
          data: {
            phoneNumber: phoneNumbers[i],
            country: dto.country,
            operator: dto.operator,
            amount: Number(amounts[i]),
            currency: dto.currency,
            status: 'PENDING',
            type: 'TOPUP',
            paymentMethod: 'STRIPE'
          }
        });
        transactionIds.push(transaction.id);
      }

      // Tạo paymentIntent với metadata.transactionId là chuỗi các id nối bằng ;
      const transactionIdStr = transactionIds.join(';');
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Number(amounts.reduce((acc, cur) => acc + Number(cur), 0)),
        currency: dto.currency.toLowerCase(),
        payment_method_types: ['card'],
        metadata: {
          transactionId: transactionIdStr, // Nối các id bằng ;
          phoneNumber: dto.phoneNumber,
          country: dto.country,
          operator: dto.operator
        }
      });

      // Ghi log cho từng transaction
      for (let i = 0; i < phoneNumbers.length; i++) {
        await this.prismaService.activityLog.create({
          data: {
            phoneNumber: phoneNumbers[i],
            action: 'CREATE_PAYMENT_INTENT',
            metadata: {
              transactionId: transactionIds[i],
              paymentIntentId: paymentIntent.id,
              amount: amounts[i],
              currency: dto.currency
            }
          }
        });
      }

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        transactionId: transactionIdStr
      };
    } catch (error) {
      this.logger.error('Error creating payment intent:', error);
      throw new TransactionException(
        'Failed to create payment intent',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  
}
