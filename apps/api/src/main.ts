import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(cookieParser());
  app.setGlobalPrefix("api");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // strip unknown keys
      forbidNonWhitelisted: true, // and reject requests that send them
      transform: true,
    }),
  );

  // Credentials must be allowed for the httpOnly cookies to travel.
  app.enableCors({
    origin: config.get<string>("WEB_ORIGIN", "http://localhost:3000"),
    credentials: true,
  });

  await app.listen(config.get<number>("PORT", 4000));
}

void bootstrap();
