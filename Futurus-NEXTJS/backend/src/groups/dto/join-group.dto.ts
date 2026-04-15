import {
  IsNumber,
  IsString,
  IsOptional,
  Min,
  IsEmail,
  IsIn,
} from 'class-validator';

export class JoinGroupDto {
  @IsNumber()
  @Min(0.01)
  contributionAmount: number;

  @IsString()
  @IsIn(['YES', 'NO'])
  memberChosenOutcome: 'YES' | 'NO';
}

export class SetOutcomeDto {
  @IsString()
  outcome: 'YES' | 'NO';
}

export class VoteDto {
  @IsString()
  outcome: 'YES' | 'NO';
}

export class InviteMemberDto {
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

export class ApproveGroupDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

export class RejectGroupDto {
  @IsString()
  reason: string;
}
