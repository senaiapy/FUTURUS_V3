import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user tasks separately
    const userTasks = await (this.prisma as any).userTask.findMany({
      where: { userId },
      include: { task: true },
      orderBy: { completedAt: 'desc' },
    });

    // Get coin transactions separately
    const recentTransactions = await (
      this.prisma as any
    ).coinTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get referral count
    const referralCount = await (this.prisma as any).referral.count({
      where: { referrerId: userId, status: 1 },
    });

    const coinBalance = parseFloat(
      (user as any).coinBalance?.toString() || '0',
    );
    const totalCoinsEarned = await (
      this.prisma as any
    ).coinTransaction.aggregate({
      where: {
        userId,
        type: 'EARNED',
      },
      _sum: { amount: true },
    });

    const completedTasks = userTasks.filter(
      (ut: any) => ut.status === 'COMPLETED',
    ).length;
    const allTasks = await (this.prisma as any).gameTask.count({
      where: { status: 1 },
    });
    const referralCode = (user as any).referralCode || `REF${userId}`;

    // Find next available task
    const nextTask =
      userTasks.find(
        (ut: any) => ut.status !== 'COMPLETED' && ut.status !== 'LOCKED',
      ) || userTasks[0];

    return {
      coinBalance,
      totalCoinsEarned: parseFloat(
        totalCoinsEarned._sum.amount?.toString() || '0',
      ),
      referralCode,
      onboardingComplete: user.profileComplete || false,
      completedTasks,
      totalTasks: allTasks,
      referralCount,
      nextTask: nextTask
        ? {
            id: nextTask.id.toString(),
            status: nextTask.status || 'AVAILABLE',
            task: {
              id: nextTask.task.id.toString(),
              name: nextTask.task.name || '',
              description: nextTask.task.description || '',
              coinReward: parseFloat(
                nextTask.task.coinReward?.toString() || '0',
              ),
            },
          }
        : undefined,
      recentTransactions: recentTransactions.map((t: any) => ({
        id: t.id.toString(),
        amount: parseFloat(t.amount?.toString() || '0'),
        type: t.type || 'TRANSACTION',
        description: t.source || 'Transaction',
        createdAt: t.createdAt.toISOString(),
      })),
    };
  }

  async getCoinBalance(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      balance: parseFloat((user as any).coinBalance?.toString() || '0'),
    };
  }

  async getCoinTransactions(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      (this.prisma as any).coinTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (this.prisma as any).coinTransaction.count({ where: { userId } }),
    ]);

    return {
      transactions: transactions.map((t: any) => ({
        id: t.id.toString(),
        amount: parseFloat(t.amount?.toString() || '0'),
        type: t.type || 'TRANSACTION',
        source: t.source || 'TRANSACTION',
        reference: t.reference || '',
        createdAt: t.createdAt.toISOString(),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllTasks() {
    const tasks = await (this.prisma as any).gameTask.findMany({
      where: { status: 1 },
      orderBy: { id: 'asc' },
    });

    return tasks.map((t: any) => ({
      id: t.id.toString(),
      name: t.name || '',
      description: t.description || '',
      coinReward: parseFloat(t.coinReward?.toString() || '0'),
      taskType: t.type || 'ONE_TIME',
      delayHours: 0,
      orderIndex: t.id,
      isActive: t.status === 1,
      verificationRequired: false,
    }));
  }

  async getUserTasks(userId: number) {
    // Get all tasks
    const allTasks = await (this.prisma as any).gameTask.findMany({
      where: { status: 1 },
      orderBy: { id: 'asc' },
    });

    // Get user's completed/in-progress tasks
    const userTasks = await (this.prisma as any).userTask.findMany({
      where: { userId },
      include: { task: true },
      orderBy: { id: 'asc' },
    });

    // Create user tasks for tasks the user hasn't started yet
    const userTasksMap = new Map(userTasks.map((ut: any) => [ut.taskId, ut]));
    const tasksToCreate = allTasks.filter((t: any) => !userTasksMap.has(t.id));

    // Create missing user tasks
    for (const task of tasksToCreate) {
      await (this.prisma as any).userTask.create({
        data: {
          userId,
          taskId: task.id,
          status: 'NOT_STARTED',
        },
      });
    }

    // Get all user tasks again after creating missing ones
    const allUserTasks = await (this.prisma as any).userTask.findMany({
      where: { userId },
      include: { task: true },
      orderBy: { id: 'asc' },
    });

    return {
      userTasks: allUserTasks.map((ut: any) => ({
        id: ut.id.toString(),
        taskId: ut.taskId.toString(),
        status: ut.status,
        startedAt: ut.startedAt?.toISOString(),
        completedAt: ut.completedAt?.toISOString(),
        proofUrl: ut.proofUrl,
        task: {
          id: ut.task.id.toString(),
          name: ut.task.name || '',
          description: ut.task.description || '',
          coinReward: parseFloat(ut.task.coinReward?.toString() || '0'),
          type: ut.task.type || 'ONE_TIME',
          delayHours: 0,
          orderIndex: ut.task.id,
          isActive: ut.task.status === 1,
          verificationRequired: false,
        },
      })),
    };
  }

  async startTask(userId: number, taskId: string) {
    const task = await (this.prisma as any).gameTask.findUnique({
      where: { id: parseInt(taskId) },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Find or create user task
    const existingUserTask = await (this.prisma as any).userTask.findFirst({
      where: { userId, taskId: parseInt(taskId) },
    });

    if (existingUserTask) {
      await (this.prisma as any).userTask.update({
        where: { id: existingUserTask.id },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });
    } else {
      await (this.prisma as any).userTask.create({
        data: {
          userId,
          taskId: parseInt(taskId),
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });
    }

    return {
      userTask: {
        id: existingUserTask?.id.toString() || taskId,
        status: 'IN_PROGRESS',
        startedAt: new Date().toISOString(),
      },
    };
  }

  async completeTask(userId: number, taskId: string) {
    const userTask = await (this.prisma as any).userTask.findFirst({
      where: { userId, taskId: parseInt(taskId) },
      include: { task: true },
    });

    if (!userTask) {
      throw new NotFoundException('User task not found');
    }

    if (userTask.status === 'COMPLETED') {
      throw new BadRequestException('Task already completed');
    }

    // Update user task
    await (this.prisma as any).userTask.update({
      where: { id: userTask.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Award coins to user
    const coinReward = parseFloat(userTask.task.coinReward?.toString() || '0');
    if (coinReward > 0) {
      // Create coin transaction
      await (this.prisma as any).coinTransaction.create({
        data: {
          userId,
          amount: coinReward,
          type: 'EARNED',
          source: 'TASK_COMPLETION',
          reference: userTask.task.name,
        },
      });

      // Update user coin balance
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      const currentBalance = parseFloat(
        (user as any).coinBalance?.toString() || '0',
      );
      await this.prisma.user.update({
        where: { id: userId },
        data: { coinBalance: currentBalance + coinReward },
      });
    }

    return {
      userTask: {
        id: userTask.id.toString(),
        status: 'COMPLETED',
        coinReward,
        completedAt: new Date().toISOString(),
      },
    };
  }

  async generateReferralCode(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const referralCode = `REF${userId}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Update user with referral code
    await this.prisma.user.update({
      where: { id: userId },
      data: { referralCode },
    });

    return { code: referralCode };
  }

  async getReferrals(userId: number) {
    const referrals = await (this.prisma as any).referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      referrals: referrals.map((r: any) => ({
        id: r.id.toString(),
        referrerId: r.referrerId.toString(),
        referredUserId: r.referredId.toString(),
        code: r.code || '',
        status: r.status === 1 ? 'COMPLETED' : 'PENDING',
        bonusAwarded: r.status === 1,
        createdAt: r.createdAt.toISOString(),
        completedAt: r.updatedAt?.toISOString(),
        referrer: {
          id: r.referrerId.toString(),
          email: '',
          name: '',
        },
        referred: {
          id: r.referred.id.toString(),
          email: r.referred.email || '',
          name: `${r.referred.firstname || ''} ${r.referred.lastname || ''}`.trim(),
        },
      })),
      totalReferrals: referrals.length,
      totalCommissions: referrals.reduce(
        (sum: number, r: any) =>
          sum + parseFloat(r.commission?.toString() || '0'),
        0,
      ),
    };
  }

  async getReferralByCode(code: string) {
    const referral = await (this.prisma as any).referral.findFirst({
      where: { code },
      include: {
        referrer: {
          select: { id: true, username: true, email: true },
        },
        referred: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    if (!referral) {
      return { referral: null };
    }

    return {
      referral: {
        id: referral.id.toString(),
        referrerId: referral.referrerId.toString(),
        referredUserId: referral.referredId.toString(),
        code: referral.code || '',
        status: referral.status === 1 ? 'COMPLETED' : 'PENDING',
        bonusAwarded: referral.status === 1,
        createdAt: referral.createdAt.toISOString(),
        completedAt: referral.updatedAt?.toISOString(),
        referrer: {
          id: referral.referrer.id.toString(),
          email: referral.referrer.email || '',
          name: referral.referrer.username || '',
        },
        referred: {
          id: referral.referred.id.toString(),
          email: referral.referred.email || '',
          name: referral.referred.username || '',
        },
      },
    };
  }

  // Admin methods
  async createTask(data: any) {
    const task = await (this.prisma as any).gameTask.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.taskType || 'ONE_TIME',
        coinReward: parseFloat(data.coinReward) || 0,
        status: data.isActive ? 1 : 0,
        icon: data.icon || 'star',
      },
    });

    return {
      task: {
        id: task.id.toString(),
        name: task.name,
        description: task.description,
        coinReward: parseFloat(task.coinReward?.toString() || '0'),
        taskType: task.type,
        delayHours: 0,
        orderIndex: task.id,
        isActive: task.status === 1,
        verificationRequired: false,
      },
    };
  }

  async updateTask(taskId: number, data: any) {
    const task = await (this.prisma as any).gameTask.update({
      where: { id: taskId },
      data: {
        name: data.name,
        description: data.description,
        type: data.taskType,
        coinReward: parseFloat(data.coinReward),
        status: data.isActive ? 1 : 0,
        icon: data.icon,
      },
    });

    return {
      task: {
        id: task.id.toString(),
        name: task.name,
        description: task.description,
        coinReward: parseFloat(task.coinReward?.toString() || '0'),
        taskType: task.type,
        delayHours: 0,
        orderIndex: task.id,
        isActive: task.status === 1,
        verificationRequired: false,
      },
    };
  }
}
