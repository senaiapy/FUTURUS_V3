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
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async getComments(
    @Query('marketId', ParseIntPipe) marketId: number,
    @Query('page') page?: string,
  ) {
    return this.commentsService.getComments(marketId, page ? +page : 1);
  }

  @Get(':id/replies')
  async getReplies(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.getReplies(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createComment(
    @GetUser() user: any,
    @Body() body: { marketId: number; comment: string; parentId?: number },
  ) {
    return this.commentsService.createComment(user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async toggleLike(
    @GetUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.commentsService.toggleLike(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/report')
  async reportComment(
    @GetUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason?: string,
  ) {
    return this.commentsService.reportComment(user.id, id, reason);
  }
}
