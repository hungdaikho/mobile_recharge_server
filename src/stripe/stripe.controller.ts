import { Controller, Post, Body, HttpStatus, RawBodyRequest, Req, HttpException, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Request } from 'express';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  @ApiOperation({ summary: 'Create a new payment intent' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Payment intent created successfully',
    schema: {
      type: 'object',
      properties: {
        clientSecret: { type: 'string' },
        paymentIntentId: { type: 'string' },
        transactionId: { type: 'string' }
      }
    }
  })
  @Post('create-payment')
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.stripeService.createPaymentIntent(createPaymentDto);
  }

  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Webhook received successfully'
  })
  @Post('webhook')
  async handleWebhook(@Req() request: RawBodyRequest<Request>) {
    const sig = request.headers['stripe-signature'];
    const rawBody = request.rawBody;
    if (!sig || !rawBody) {
      throw new HttpException('No signature or body found', HttpStatus.BAD_REQUEST);
    }
    try {
      // Get Stripe secret key from database
      const stripeCredential = await this.prisma.apiCredential.findUnique({
        where: { name: 'Stripe' }
      });

      if (!stripeCredential) {
        throw new HttpException('Stripe credentials not found', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      if (!stripeCredential.webhook) {
        throw new HttpException('Webhook secret not configured', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      // Verify webhook signature
      const stripe = new Stripe(stripeCredential.apiSecret, {
        apiVersion: '2025-05-28.basil',
      });
      const event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        stripeCredential.webhook
      );

      // Tách biệt từng event
      const eventObject = event.data.object as any;
      console.log(eventObject)
      const id = eventObject.id;

      switch (event.type) {
        case 'payment_intent.succeeded':
          console.log('[Stripe] Payment succeeded:', { id, event: event.type });
          break;
        case 'payment_intent.payment_failed':
          console.log('[Stripe] Payment failed:', { id, event: event.type });
          break;
        case 'payment_intent.partially_funded':
          console.log('[Stripe] Payment partially funded:', { id, event: event.type });
          break;
        default:
          console.log('[Stripe] Unhandled event:', { id, event: event.type });
      }

      return { received: true, eventType: event.type };
    } catch (err) {
      console.error('Webhook Error:', err.message);
      throw new HttpException('Webhook Error', HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Get('api-key')
  async getPublicKey() {
    return this.stripeService.getPublicKey()
  }
}
