import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { VerificationService } from "./verification.service";
import { SecuredStorageService } from "../storage/secured-storage.service";
import { RequestPhoneDto, ConfirmPhoneDto } from "./dto/phone.dto";
import { SubmitIdDto } from "./dto/submit-id.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthedUser } from "../auth/strategies/jwt.strategy";

type UploadedImage = { buffer: Buffer; originalname: string; mimetype: string; size: number };
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

@Controller("verify")
export class VerificationController {
  constructor(
    private readonly verification: VerificationService,
    private readonly storage: SecuredStorageService,
  ) {}

  @Post("phone/request")
  @HttpCode(200)
  requestPhone(@CurrentUser() user: AuthedUser, @Body() dto: RequestPhoneDto) {
    return this.verification.requestPhoneCode(user, dto.phone);
  }

  @Post("phone/confirm")
  @HttpCode(200)
  confirmPhone(@CurrentUser() user: AuthedUser, @Body() dto: ConfirmPhoneDto) {
    return this.verification.confirmPhoneCode(user, dto.code);
  }

  /**
   * Multipart: idFront + selfie (required), idBack (optional), plus the typed
   * SubmitIdDto fields. Images go straight to the secured store; only their
   * paths are persisted, never served publicly.
   */
  @Post("id")
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "idFront", maxCount: 1 },
        { name: "idBack", maxCount: 1 },
        { name: "selfie", maxCount: 1 },
      ],
      { limits: { fileSize: MAX_IMAGE_BYTES } },
    ),
  )
  async submitId(
    @CurrentUser() user: AuthedUser,
    @Body() dto: SubmitIdDto,
    @UploadedFiles() files: { idFront?: UploadedImage[]; idBack?: UploadedImage[]; selfie?: UploadedImage[] },
  ) {
    const idFront = files.idFront?.[0];
    const selfie = files.selfie?.[0];
    const idBack = files.idBack?.[0];
    if (!idFront || !selfie) throw new BadRequestException("An ID photo and a selfie are both required.");

    for (const f of [idFront, selfie, idBack].filter(Boolean) as UploadedImage[]) {
      if (!ALLOWED.includes(f.mimetype)) throw new BadRequestException("Upload JPEG, PNG or WebP images.");
    }

    const save = (kind: string, f: UploadedImage) =>
      this.storage.save(user.id, kind, { buffer: f.buffer, originalName: f.originalname });

    const idFrontPath = await save("id-front", idFront);
    const selfiePath = await save("selfie", selfie);
    const idBackPath = idBack ? await save("id-back", idBack) : undefined;

    return this.verification.submitId(user, {
      fullName: dto.fullName,
      dob: dto.dob,
      idNumber: dto.idNumber,
      idFrontPath,
      idBackPath,
      selfiePath,
    });
  }
}
