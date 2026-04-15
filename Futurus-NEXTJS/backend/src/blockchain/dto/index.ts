import { IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWalletDto {
  @IsOptional()
  @IsBoolean()
  custodial?: boolean = true;
}

export class LinkWalletDto {
  @IsNotEmpty()
  @IsString()
  publicKey: string;
}

export class DepositFutDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;
}

export class WithdrawFutDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @IsNotEmpty()
  @IsString()
  destinationWallet: string;
}

export class PlaceBlockchainBetDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  marketId: number;

  @IsNotEmpty()
  @IsBoolean()
  isYes: boolean;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;
}

export class ClaimWinningsDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  marketId: number;
}

export class DeployMarketDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  marketId: number;

  @IsOptional()
  @IsString()
  feedPubkey?: string;
}

export class ResolveMarketDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  marketId: number;

  @IsOptional()
  @IsBoolean()
  manualResult?: boolean;
}
