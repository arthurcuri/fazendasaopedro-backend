// src/main.ts
import { NestFactory }      from '@nestjs/core';
import { AppModule }        from './app.module';
import { ValidationPipe }   from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
  }));


  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true,
  });


  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Fazenda São Pedro API')
    .setDescription(`
## API da Fazenda São Pedro!

Documentação para integração com o sistema de Gestão da Fazenda São Pedro.
---
Esta API foi desenvolvida utilizando **NestJS** e **TypeORM**._
`)
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Insira o token JWT no formato: Bearer <seu_token>',
      in: 'header',
    }, 'JWT')
    .addServer('https://api.fazendasaopedro.appsirius.com', 'Servidor Produção')
    .addServer('http://localhost:3085', 'Servidor Local')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3085);
  console.log(`API rodando na porta ${process.env.PORT ?? 3085}`);
  console.log(`Swagger disponível em http://localhost:${process.env.PORT ?? 3085}/api-docs`);
}
bootstrap();
