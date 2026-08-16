import { IsString, Matches, Length } from "class-validator";

export class RequestPhoneDto {
  // E.164-ish: a leading + and 7–15 digits.
  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, { message: "Enter a valid phone number in international format." })
  phone!: string;
}

export class ConfirmPhoneDto {
  @IsString()
  @Length(6, 6, { message: "The code is 6 digits." })
  @Matches(/^\d{6}$/, { message: "The code is 6 digits." })
  code!: string;
}
