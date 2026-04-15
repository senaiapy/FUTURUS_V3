import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GatewaysService {
  constructor(private prisma: PrismaService) {}

  // Automatic Gateways
  async getAutomaticGateways() {
    return this.prisma.gateway.findMany({
      where: { crypto: 0 },
      orderBy: { id: 'desc' },
    });
  }

  async getAutomaticGatewayByAlias(alias: string) {
    return this.prisma.gateway.findFirst({ where: { alias } });
  }

  async createAutomaticGateway(data: any) {
    const maxCode = await this.prisma.gateway.findFirst({
      orderBy: { code: 'desc' },
    });
    const newCode = (maxCode?.code || 0) + 1;

    return this.prisma.gateway.create({
      data: {
        ...data,
        code: newCode,
        crypto: 0,
      },
    });
  }

  async updateAutomaticGateway(code: number, data: any) {
    return this.prisma.gateway.update({
      where: { code },
      data,
    });
  }

  async deleteAutomaticGateway(id: number) {
    // First delete related currencies
    await this.prisma.gatewayCurrency.deleteMany({ where: { methodCode: id } });
    return this.prisma.gateway.delete({ where: { id } });
  }

  async toggleAutomaticGatewayStatus(id: number, status: number) {
    return this.prisma.gateway.update({
      where: { id },
      data: { status },
    });
  }

  // Manual Methods (Withdraw Methods)
  async getManualMethods() {
    return this.prisma.withdrawMethod.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async getNewManualMethod() {
    // Return form data for new method
    return this.prisma.form.findFirst({ where: { act: 'withdraw_method' } });
  }

  async getManualMethodByAlias(alias: string) {
    return this.prisma.withdrawMethod.findFirst({
      where: { id: parseInt(alias) || undefined },
    });
  }

  async createManualMethod(data: any) {
    return this.prisma.withdrawMethod.create({ data });
  }

  async updateManualMethod(id: number, data: any) {
    return this.prisma.withdrawMethod.update({
      where: { id },
      data,
    });
  }

  async toggleManualMethodStatus(id: number, status: number) {
    return this.prisma.withdrawMethod.update({
      where: { id },
      data: { status },
    });
  }

  // Gateway Currencies
  async getGatewayCurrencies() {
    return this.prisma.gatewayCurrency.findMany({
      orderBy: { id: 'desc' },
      include: { gateway: true },
    });
  }

  async getGatewayCurrenciesByMethod(methodCode: number) {
    return this.prisma.gatewayCurrency.findMany({
      where: { methodCode },
      orderBy: { id: 'desc' },
    });
  }

  async createGatewayCurrency(data: any) {
    return this.prisma.gatewayCurrency.create({ data });
  }

  async updateGatewayCurrency(id: number, data: any) {
    return this.prisma.gatewayCurrency.update({
      where: { id },
      data,
    });
  }

  async deleteGatewayCurrency(id: number) {
    return this.prisma.gatewayCurrency.delete({ where: { id } });
  }
}
