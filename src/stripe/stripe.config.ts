export const stripeConfig = {
  webhookEndpoint: process.env.STRIPE_WEBHOOK_ENDPOINT || 'https://12f7-14-162-180-149.ngrok-free.app/stripe/webhook',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '', // Thêm webhook secret từ Stripe Dashboard vào đây
}; 