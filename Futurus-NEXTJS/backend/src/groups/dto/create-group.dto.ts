import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsDateString,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO for proposing a new market when creating a group
export class ProposedMarketDto {
  @IsString()
  @MinLength(10)
  @MaxLength(255)
  question: string;

  @IsNumber()
  categoryId: number;

  @IsNumber()
  @IsOptional()
  subcategoryId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @IsOptional()
  @Min(10)
  initialYesPool?: number;

  @IsNumber()
  @IsOptional()
  @Min(10)
  initialNoPool?: number;
}

export class CreateGroupDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsNumber()
  @IsOptional()
  marketId?: number;

  @ValidateNested()
  @Type(() => ProposedMarketDto)
  @IsOptional()
  proposedMarket?: ProposedMarketDto;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean = true;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minContribution?: number = 0;

  @IsNumber()
  @IsOptional()
  maxContribution?: number;

  @IsNumber()
  @IsOptional()
  @Min(2)
  maxParticipants?: number;

  @IsNumber()
  @Min(10)
  targetLiquidity: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10)
  managerFeePercent?: number = 0;

  @IsNumber()
  @IsOptional()
  decisionMethod?: number = 0; // 0=MANAGER, 1=VOTING
}

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minContribution?: number;

  @IsNumber()
  @IsOptional()
  maxContribution?: number;

  @IsNumber()
  @IsOptional()
  @Min(2)
  maxParticipants?: number;

  @IsNumber()
  @IsOptional()
  targetLiquidity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10)
  managerFeePercent?: number;
}
