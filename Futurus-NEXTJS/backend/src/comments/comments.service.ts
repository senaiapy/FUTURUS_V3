import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async getComments(marketId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { marketId, parentId: 0, status: 1 },
        include: {
          user: { select: { id: true, username: true, image: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.comment.count({
        where: { marketId, parentId: 0, status: 1 },
      }),
    ]);

    return { comments, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getReplies(commentId: number) {
    return this.prisma.comment.findMany({
      where: { parentId: commentId, status: 1 },
      include: {
        user: { select: { id: true, username: true, image: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createComment(
    userId: number,
    data: { marketId: number; comment: string; parentId?: number },
  ) {
    const comment = await this.prisma.comment.create({
      data: {
        userId,
        marketId: data.marketId,
        parentId: data.parentId || 0,
        comment: data.comment,
        status: 1,
      },
      include: {
        user: { select: { id: true, username: true, image: true } },
      },
    });

    // Update repliesCount of parent
    if (data.parentId && data.parentId > 0) {
      await this.prisma.comment.update({
        where: { id: data.parentId },
        data: { repliesCount: { increment: 1 } },
      });
    }

    return comment;
  }

  async toggleLike(userId: number, commentId: number) {
    const existing = await this.prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    if (existing) {
      await this.prisma.commentLike.delete({
        where: { userId_commentId: { userId, commentId } },
      });
      await this.prisma.comment.update({
        where: { id: commentId },
        data: { likesCount: { decrement: 1 } },
      });
      return { liked: false };
    } else {
      await this.prisma.commentLike.create({
        data: { userId, commentId },
      });
      await this.prisma.comment.update({
        where: { id: commentId },
        data: { likesCount: { increment: 1 } },
      });
      return { liked: true };
    }
  }

  async reportComment(userId: number, commentId: number, reason?: string) {
    await this.prisma.commentReport.create({
      data: { userId, commentId, reason },
    });
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { isReported: true },
    });
    return { reported: true };
  }

  // Admin
  async getReportedComments() {
    return this.prisma.comment.findMany({
      where: { isReported: true },
      include: {
        user: { select: { id: true, username: true } },
        market: { select: { id: true, question: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleCommentStatus(id: number) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    return this.prisma.comment.update({
      where: { id },
      data: { status: comment.status === 1 ? 0 : 1 },
    });
  }
}
