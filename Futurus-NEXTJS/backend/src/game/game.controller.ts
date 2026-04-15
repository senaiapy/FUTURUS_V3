import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Put,
} from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('game')
@UseGuards(JwtAuthGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('progress/dashboard')
  async getDashboard(@GetUser() user: any) {
    return this.gameService.getDashboard(user.id);
  }

  @Get('coins/balance')
  async getCoinBalance(@GetUser() user: any) {
    return this.gameService.getCoinBalance(user.id);
  }

  @Get('coins/transactions')
  async getCoinTransactions(@GetUser() user: any) {
    return this.gameService.getCoinTransactions(user.id);
  }

  @Get('tasks')
  async getAllTasks() {
    return this.gameService.getAllTasks();
  }

  @Get('tasks/user/my-tasks')
  async getUserTasks(@GetUser() user: any) {
    return this.gameService.getUserTasks(user.id);
  }

  @Post('progress/start/:taskId')
  async startTask(@GetUser() user: any, @Param('taskId') taskId: string) {
    return this.gameService.startTask(user.id, taskId);
  }

  @Post('progress/complete/:taskId')
  async completeTask(@GetUser() user: any, @Param('taskId') taskId: string) {
    return this.gameService.completeTask(user.id, taskId);
  }

  @Post('referrals/generate')
  async generateReferralCode(@GetUser() user: any) {
    return this.gameService.generateReferralCode(user.id);
  }

  @Get('referrals')
  async getReferrals(@GetUser() user: any) {
    return this.gameService.getReferrals(user.id);
  }

  @Get('referrals/:code')
  async getReferralByCode(@Param('code') code: string) {
    return this.gameService.getReferralByCode(code);
  }

  // Admin endpoints
  @Get('tasks/admin/all')
  @UseGuards(JwtAuthGuard)
  async getAllTasksAdmin() {
    return this.gameService.getAllTasks();
  }

  @Post('tasks/admin')
  @UseGuards(JwtAuthGuard)
  async createTask(@Body() data: any) {
    return this.gameService.createTask(data);
  }

  @Put('tasks/admin/:id')
  @UseGuards(JwtAuthGuard)
  async updateTask(@Param('id') id: string, @Body() data: any) {
    return this.gameService.updateTask(parseInt(id), data);
  }
}
