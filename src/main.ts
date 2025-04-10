// src/main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Validation globale des DTOs
  app.useGlobalPipes(new ValidationPipe());
  
  // Configuration de Swagger
  const config = new DocumentBuilder()
    .setTitle('Service de Documents API')
    .setDescription('API pour gérer le CRUD des documents de tous types')
    .setVersion('1.0')
    .addTag('documents')
    .addBearerAuth() // Ajoutez ceci si vous prévoyez d'utiliser l'authentification JWT
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();