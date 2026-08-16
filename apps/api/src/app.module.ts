import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { PermissionModule } from "./permission/permission.module";
import { AuthModule } from "./auth/auth.module";
import { PostsModule } from "./posts/posts.module";
import { ProfilesModule } from "./profiles/profiles.module";
import { VerificationModule } from "./verification/verification.module";
import { ChatModule } from "./chat/chat.module";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { RolesGuard } from "./auth/guards/roles.guard";
import { VerifiedGuard } from "./auth/guards/verified.guard";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // SMS no longer throttles sign-ups, so this carries that load (NFR-SEC-4).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    PermissionModule,
    AuthModule,
    PostsModule,
    ProfilesModule,
    VerificationModule,
    ChatModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Order matters: authenticate, then check role, then check verification.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: VerifiedGuard },
  ],
})
export class AppModule {}
