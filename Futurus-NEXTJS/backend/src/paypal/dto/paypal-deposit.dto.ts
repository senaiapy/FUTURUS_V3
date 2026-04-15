import { IsNumber, IsPositive, Min } from 'class-validator';

export class PaypalDepositDto {
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;
}
