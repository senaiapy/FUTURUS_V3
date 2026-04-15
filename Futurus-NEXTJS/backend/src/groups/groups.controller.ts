import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { CreateGroupDto, UpdateGroupDto } from './dto/create-group.dto';
import {
  JoinGroupDto,
  SetOutcomeDto,
  VoteDto,
  InviteMemberDto,
} from './dto/join-group.dto';

// Directory for proposed market images
const proposedMarketsDir = join(process.cwd(), 'uploads', 'proposed-markets');
if (!existsSync(proposedMarketsDir)) {
  mkdirSync(proposedMarketsDir, { recursive: true });
}

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  @Get()
  findAll(
    @Query('marketId') marketId?: string,
    @Query('status') status?: string,
    @Query('isPublic') isPublic?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.groupsService.findAll({
      marketId: marketId ? parseInt(marketId) : undefined,
      status: status ? parseInt(status) : undefined,
      isPublic: isPublic ? isPublic === 'true' : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Get('invite/:code')
  getInvitation(@Param('code') code: string) {
    return this.groupsService.getInvitation(code);
  }

  // ============================================
  // AUTHENTICATED ENDPOINTS
  // ============================================

  @Get('my-groups')
  @UseGuards(JwtAuthGuard)
  getMyGroups(@GetUser() user: any) {
    return this.groupsService.findUserGroups(user.id);
  }

  @Get(':slug')
  @UseGuards(JwtAuthGuard)
  findOne(@GetUser() user: any, @Param('slug') slug: string) {
    return this.groupsService.findBySlug(slug, user?.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@GetUser() user: any, @Body() dto: CreateGroupDto) {
    return this.groupsService.create(user.id, dto);
  }

  @Post('upload/market-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: proposedMarketsDir,
        filename: (_req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(new Error('Only image files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    }),
  )
  async uploadMarketImage(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/proposed-markets/${file.filename}` };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateGroupDto,
  ) {
    // TODO: Implement update
    return { message: 'Update not implemented yet' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@GetUser() user: any, @Param('id') id: string) {
    return this.groupsService.cancelAndRefund(
      parseInt(id),
      'Cancelled by manager',
    );
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  join(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() dto: JoinGroupDto,
  ) {
    return this.groupsService.join(user.id, parseInt(id), dto);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  leave(@GetUser() user: any, @Param('id') id: string) {
    return this.groupsService.leave(user.id, parseInt(id));
  }

  @Post(':id/submit-approval')
  @UseGuards(JwtAuthGuard)
  submitForApproval(@GetUser() user: any, @Param('id') id: string) {
    return this.groupsService.submitForApproval(user.id, parseInt(id));
  }

  @Post(':id/lock')
  @UseGuards(JwtAuthGuard)
  lock(@GetUser() user: any, @Param('id') id: string) {
    return this.groupsService.lockGroup(user.id, parseInt(id));
  }

  @Post(':id/set-outcome')
  @UseGuards(JwtAuthGuard)
  setOutcome(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() dto: SetOutcomeDto,
  ) {
    return this.groupsService.setOutcome(user.id, parseInt(id), dto.outcome);
  }

  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  vote(@GetUser() user: any, @Param('id') id: string, @Body() dto: VoteDto) {
    return this.groupsService.vote(user.id, parseInt(id), dto.outcome);
  }

  @Post(':id/execute')
  @UseGuards(JwtAuthGuard)
  execute(@GetUser() user: any, @Param('id') id: string) {
    return this.groupsService.executeBet(user.id, parseInt(id));
  }

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  getMembers(@Param('id') id: string) {
    return this.groupsService.getMembers(parseInt(id));
  }

  @Get(':id/transactions')
  @UseGuards(JwtAuthGuard)
  getTransactions(@GetUser() user: any, @Param('id') id: string) {
    return this.groupsService.getTransactions(parseInt(id), user.id);
  }

  @Post(':id/invite')
  @UseGuards(JwtAuthGuard)
  invite(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.groupsService.createInvitation(user.id, parseInt(id), dto);
  }

  @Post('invite/:code/accept')
  @UseGuards(JwtAuthGuard)
  acceptInvitation(
    @GetUser() user: any,
    @Param('code') code: string,
    @Body() dto: JoinGroupDto,
  ) {
    return this.groupsService.acceptInvitation(user.id, code, dto);
  }
}
