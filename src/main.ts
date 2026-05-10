import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  app.setGlobalPrefix('api');

  await app.listen(3000);
  console.log('Backend jalan di http://localhost:3000');
}
bootstrap();