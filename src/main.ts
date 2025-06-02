import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as winston from 'winston';

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

process.on('uncaughtException', (err) => {
  logger.error({ message: err.message, stack: err.stack, type: 'uncaughtException' });
});

process.on('unhandledRejection', (reason: any) => {
  logger.error({ message: reason?.message || reason, stack: reason?.stack, type: 'unhandledRejection' });
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Mobile Recharge API')
    .setDescription('API documentation for Mobile Recharge Server')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
