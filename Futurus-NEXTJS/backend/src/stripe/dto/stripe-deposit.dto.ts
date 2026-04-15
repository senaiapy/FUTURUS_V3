import { IsNumber, IsPositive, Min } from 'class-validator';

export class StripeDepositDto {
  @IsNumber()
  @IsPositive()
  @Min(5)
  amount: number;
}
