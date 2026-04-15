import { IsNumber, IsString, IsIn, Min, IsOptional } from 'class-validator';

export class AdminBalanceDto {
  @IsNumber()
  @Min(0, { message: 'Amount must be greater than or equal to 0' })
  amount: number;

  @IsString()
  @IsIn(['add', 'sub'], { message: 'Type must be either "add" or "sub"' })
  @IsOptional()
  type?: 'add' | 'sub';

  @IsString()
  @IsOptional()
  remark?: string;
}
