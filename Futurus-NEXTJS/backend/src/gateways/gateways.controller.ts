import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { GatewaysService } from './gateways.service';
import { AdminGuard } from '../admin/admin.guard';

@Controller('admin/gateways')
@UseGuards(AdminGuard)
export class GatewaysController {
  constructor(private readonly gatewaysService: GatewaysService) {}

  // Automatic Gateways
  @Get('automatic')
  async getAutomaticGateways() {
    return this.gatewaysService.getAutomaticGateways();
  }

  @Get('automatic/:alias')
  async getAutomaticGateway(@Param('alias') alias: string) {
    return this.gatewaysService.getAutomaticGatewayByAlias(alias);
  }

  @Post('automatic')
  async createAutomaticGateway(@Body() body: any) {
    return this.gatewaysService.createAutomaticGateway(body);
  }

  @Patch('automatic/:code')
  async updateAutomaticGateway(
    @Param('code', ParseIntPipe) code: number,
    @Body() body: any,
  ) {
    return this.gatewaysService.updateAutomaticGateway(code, body);
  }

  @Delete('automatic/:id')
  async deleteAutomaticGateway(@Param('id', ParseIntPipe) id: number) {
    return this.gatewaysService.deleteAutomaticGateway(id);
  }

  @Patch('automatic/:id/status')
  async toggleAutomaticGatewayStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: number,
  ) {
    return this.gatewaysService.toggleAutomaticGatewayStatus(id, status);
  }

  // Manual Methods
  @Get('manual')
  async getManualMethods() {
    return this.gatewaysService.getManualMethods();
  }

  @Get('manual/new')
  async getNewManualMethod() {
    return this.gatewaysService.getNewManualMethod();
  }

  @Get('manual/:alias')
  async getManualMethod(@Param('alias') alias: string) {
    return this.gatewaysService.getManualMethodByAlias(alias);
  }

  @Post('manual')
  async createManualMethod(@Body() body: any) {
    return this.gatewaysService.createManualMethod(body);
  }

  @Get('manual/edit/:alias')
  async getEditManualMethod(@Param('alias') alias: string) {
    return this.gatewaysService.getManualMethodByAlias(alias);
  }

  @Patch('manual/:id')
  async updateManualMethod(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.gatewaysService.updateManualMethod(id, body);
  }

  @Patch('manual/:id/status')
  async toggleManualMethodStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: number,
  ) {
    return this.gatewaysService.toggleManualMethodStatus(id, status);
  }

  // Gateway Currencies
  @Get('currencies')
  async getGatewayCurrencies() {
    return this.gatewaysService.getGatewayCurrencies();
  }

  @Get('currencies/:methodCode')
  async getGatewayCurrenciesByMethod(
    @Param('methodCode', ParseIntPipe) methodCode: number,
  ) {
    return this.gatewaysService.getGatewayCurrenciesByMethod(methodCode);
  }

  @Post('currencies')
  async createGatewayCurrency(@Body() body: any) {
    return this.gatewaysService.createGatewayCurrency(body);
  }

  @Patch('currencies/:id')
  async updateGatewayCurrency(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.gatewaysService.updateGatewayCurrency(id, body);
  }

  @Delete('currencies/:id')
  async deleteGatewayCurrency(@Param('id', ParseIntPipe) id: number) {
    return this.gatewaysService.deleteGatewayCurrency(id);
  }
}
