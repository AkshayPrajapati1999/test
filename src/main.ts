import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomValidationPipe } from './common/utils/validations-error.exception';
import { env } from './environmant/environmant';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.useGlobalPipes(new CustomValidationPipe());

  app.enableCors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
  });

  await app.listen(env.port);
}
bootstrap();
