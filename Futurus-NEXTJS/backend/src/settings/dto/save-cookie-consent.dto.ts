import { IsBoolean, IsOptional, IsInt } from 'class-validator';

export class SaveCookieConsentDto {
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsBoolean()
  analytics: boolean;

  @IsBoolean()
  marketing: boolean;

  @IsBoolean()
  functional: boolean;

  // These will be set by the controller from request
  ipAddress?: string;
  sessionId?: string;
}
