import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AsaasService } from './asaas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

// DTOs for request validation
class PixDepositDto {
  amount: number;
  cpf: string;
}

class CardDepositDto {
  amount: number;
  card_number: string;
  holder_name: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
  installments: number;
  holder_cpf: string;
  holder_email: string;
  holder_phone: string;
  holder_postal_code: string;
  holder_address: string;
  holder_address_number: string;
  holder_province: string;
}

class DepositStatusDto {
  trx: string;
}

class PixWithdrawDto {
  amount: number;
  cpf: string;
  pix_key_type: string;
  pix_key: string;
}

class TransferWithdrawDto {
  amount: number;
  cpf: string;
  bank_code: string;
  bank_agency: string;
  bank_account: string;
  bank_account_type: string;
  bank_holder_name: string;
}

class WithdrawStatusDto {
  trx: string;
}

@Controller('asaas')
export class AsaasController {
  constructor(private readonly asaasService: AsaasService) {}

  // ==================== BALANCE ====================

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  async getBalance(@GetUser() user: any) {
    return this.asaasService.getBalance(user.id);
  }

  // ==================== DEPOSIT ENDPOINTS ====================

  @Get('deposit/methods')
  @UseGuards(JwtAuthGuard)
  async getDepositMethods() {
    return this.asaasService.getDepositMethods();
  }

  @Post('deposit/pix')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async depositPix(@GetUser() user: any, @Body() dto: PixDepositDto) {
    return this.asaasService.createPixDeposit(user.id, dto.amount, dto.cpf);
  }

  @Post('deposit/card')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async depositCard(@GetUser() user: any, @Body() dto: CardDepositDto) {
    return this.asaasService.createCardDeposit(user.id, dto);
  }

  @Post('deposit/status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async depositStatus(@GetUser() user: any, @Body() dto: DepositStatusDto) {
    return this.asaasService.getDepositStatus(user.id, dto.trx);
  }

  // ==================== WITHDRAW ENDPOINTS ====================

  @Get('withdraw/methods')
  @UseGuards(JwtAuthGuard)
  async getWithdrawMethods() {
    return this.asaasService.getWithdrawMethods();
  }

  @Post('withdraw/pix')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async withdrawPix(@GetUser() user: any, @Body() dto: PixWithdrawDto) {
    return this.asaasService.createPixWithdraw(user.id, dto);
  }

  @Post('withdraw/transfer')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async withdrawTransfer(
    @GetUser() user: any,
    @Body() dto: TransferWithdrawDto,
  ) {
    return this.asaasService.createTransferWithdraw(user.id, dto);
  }

  @Post('withdraw/status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async withdrawStatus(@GetUser() user: any, @Body() dto: WithdrawStatusDto) {
    return this.asaasService.getWithdrawStatus(user.id, dto.trx);
  }

  // ==================== WEBHOOK / IPN ====================

  @Post('ipn')
  @HttpCode(HttpStatus.OK)
  async webhook(@Body() body: any) {
    return this.asaasService.handleWebhook(body);
  }
}
