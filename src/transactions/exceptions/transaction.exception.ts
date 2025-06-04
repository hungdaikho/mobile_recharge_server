import { HttpException, HttpStatus } from '@nestjs/common';

export class TransactionException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(
      {
        statusCode,
        message,
        error: 'Transaction Error'
      },
      statusCode
    );
  }
}

export class UnsupportedCurrencyException extends TransactionException {
  constructor(currency: string) {
    super(`Unsupported currency: ${currency}. Only VND (₫), USD ($) and EUR (€) are supported.`, HttpStatus.BAD_REQUEST);
  }
}

export class AmountLimitExceededException extends TransactionException {
  constructor(amount: number, maxAmount: number, formattedCurrency: string) {
    super(
      `Total amount (${formattedCurrency}${amount}) exceeds maximum limit of ${formattedCurrency}${maxAmount}`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export class StripeCredentialNotFoundException extends TransactionException {
  constructor() {
    super('Stripe credentials not found or inactive', HttpStatus.INTERNAL_SERVER_ERROR);
  }
} 