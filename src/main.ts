import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.log('http', message.trim()),
      },
    }),
  );

  app.useLogger(logger);

  const config = new DocumentBuilder()
    .setTitle('Akıllı Sensör Takip Sistemi API')
    .setDescription('Sensör verileri, kullanıcı yönetimi ve log takibi API dökümantasyonu')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // localhost:3333/api

  await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
