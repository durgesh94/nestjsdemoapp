import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create the NestJS application instance
  const app = await NestFactory.create(AppModule);
  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger setup: Start
  const config = new DocumentBuilder()
    .setTitle('NestJS Demo API')
    .setDescription('Learning NestJS + TypeORM + PostgreSQL')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);
  // Swagger setup: End
  // Start the application
  await app.listen(process.env.PORT ?? 3000);
}
// Handle errors during application startup
bootstrap().catch((err) => {
  console.error('Failed to start application', err);
  process.exit(1);
});
