import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Security headers. This is a pure JSON API (files are served by nginx, not
  // here), so the browser never renders a response as a document — the default
  // CSP is harmless but irrelevant, and cross-origin reads are already governed
  // by the CORS policy below. We keep helmet's safe defaults (HSTS, nosniff,
  // frameguard, no-referrer, etc.) and only relax CORP so that a future
  // same-host asset fetch is not blocked.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

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
