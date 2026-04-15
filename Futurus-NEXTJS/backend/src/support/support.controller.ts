import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @UseGuards(JwtAuthGuard)
  @Get('tickets')
  async getUserTickets(@GetUser() user: any) {
    return this.supportService.getUserTickets(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('tickets')
  async createTicket(
    @GetUser() user: any,
    @Body() body: { subject: string; message: string; priority?: number },
  ) {
    return this.supportService.createTicket(user.id, body);
  }

  @Get('tickets/:ticket')
  async viewTicket(@Param('ticket') ticket: string) {
    return this.supportService.viewTicket(ticket);
  }

  @UseGuards(JwtAuthGuard)
  @Post('tickets/:id/reply')
  async replyTicket(
    @Param('id', ParseIntPipe) id: number,
    @Body('message') message: string,
  ) {
    return this.supportService.replyTicket(id, { message });
  }

  @UseGuards(JwtAuthGuard)
  @Post('tickets/:id/close')
  async closeTicket(@Param('id', ParseIntPipe) id: number) {
    return this.supportService.closeTicket(id);
  }
}
