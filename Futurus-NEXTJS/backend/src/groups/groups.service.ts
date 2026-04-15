import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto, UpdateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { Decimal } from 'decimal.js';
import * as crypto from 'crypto';

// Status constants
export const GroupStatus = {
  DRAFT: 0,
  PENDING_APPROVAL: 1,
  REJECTED: 2,
  OPEN: 3,
  LOCKED: 4,
  VOTING: 5,
  EXECUTED: 6,
  RESOLVED: 7,
  CANCELLED: 8,
  REFUNDED: 9,
  AWAITING_RESULT_APPROVAL: 10,
};

export const MemberStatus = {
  ACTIVE: 0,
  LEFT: 1,
  REFUNDED: 2,
  PAID_OUT: 3,
};

export const OrderStatus = {
  PENDING: 0,
  FILLED: 1,
  PARTIALLY_FILLED: 2,
  CANCELLED: 3,
  SETTLED: 4,
};

export const TransactionType = {
  CONTRIBUTION: 0,
  WITHDRAWAL: 1,
  REFUND: 2,
  PAYOUT: 3,
  MANAGER_FEE: 4,
  PLATFORM_FEE: 5,
};

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // CREATE GROUP
  // ============================================
  async create(userId: number, dto: CreateGroupDto) {
    let marketId = dto.marketId;
    let isProposedMarket = false;

    // If proposing a new market
    if (dto.proposedMarket && !dto.marketId) {
      const marketSlug = this.generateMarketSlug(dto.proposedMarket.question);

      // Create market in DRAFT status (needs admin approval)
      const newMarket = await this.prisma.market.create({
        data: {
          question: dto.proposedMarket.question,
          slug: marketSlug,
          categoryId: dto.proposedMarket.categoryId,
          subcategoryId: dto.proposedMarket.subcategoryId || 0,
          description: dto.proposedMarket.description,
          image: dto.proposedMarket.image,
          startDate: dto.proposedMarket.startDate
            ? new Date(dto.proposedMarket.startDate)
            : null,
          endDate: dto.proposedMarket.endDate
            ? new Date(dto.proposedMarket.endDate)
            : null,
          status: 0, // DRAFT - needs admin approval
          type: 1, // Single market
          options: {
            create: [
              {
                question: dto.proposedMarket.question,
                initialYesPool: dto.proposedMarket.initialYesPool || 100,
                initialNoPool: dto.proposedMarket.initialNoPool || 100,
                yesPool: dto.proposedMarket.initialYesPool || 100,
                noPool: dto.proposedMarket.initialNoPool || 100,
                commission: 5,
                chance: 50,
              },
            ],
          },
        },
      });

      marketId = newMarket.id;
      isProposedMarket = true;
    }

    // Validate that we have a market ID
    if (!marketId) {
      throw new BadRequestException(
        'Either marketId or proposedMarket is required',
      );
    }

    // For existing markets, validate it exists and is open
    if (!isProposedMarket) {
      const market = await this.prisma.market.findUnique({
        where: { id: marketId },
      });

      if (!market) {
        throw new NotFoundException('Market not found');
      }

      if (market.status !== 1) {
        throw new BadRequestException('Market is not open for betting');
      }
    }

    const slug = this.generateSlug(dto.name);
    const inviteCode =
      dto.isPublic === false ? this.generateInviteCode() : null;

    const group = await this.prisma.group.create({
      data: {
        creatorId: userId,
        marketId: marketId,
        name: dto.name,
        description: dto.description,
        slug,
        isPublic: dto.isPublic ?? true,
        inviteCode,
        minContribution: dto.minContribution ?? 0,
        maxContribution: dto.maxContribution,
        maxParticipants: dto.maxParticipants,
        targetLiquidity: dto.targetLiquidity,
        managerFeePercent: dto.managerFeePercent ?? 0,
        decisionMethod: dto.decisionMethod ?? 0,
        status: GroupStatus.DRAFT,
      },
      include: {
        creator: {
          select: { id: true, username: true, firstname: true, image: true },
        },
        market: {
          select: {
            id: true,
            question: true,
            slug: true,
            image: true,
            status: true,
          },
        },
      },
    });

    const response: any = this.formatGroupResponse(group);

    // Add flag to indicate proposed market needs approval
    if (isProposedMarket) {
      response.hasProposedMarket = true;
      response.marketNeedsApproval = true;
    }

    return response;
  }

  // ============================================
  // FIND ALL GROUPS (Public)
  // ============================================
  async findAll(params: {
    marketId?: number;
    status?: number;
    isPublic?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { marketId, status, isPublic, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (marketId) where.marketId = marketId;
    if (status !== undefined) where.status = status;
    if (isPublic !== undefined) where.isPublic = isPublic;

    // Only show approved and open groups for public listing
    if (!status) {
      where.status = {
        in: [GroupStatus.OPEN, GroupStatus.LOCKED, GroupStatus.EXECUTED],
      };
      where.adminApproved = true;
    }

    const [groups, total] = await Promise.all([
      this.prisma.group.findMany({
        where,
        include: {
          creator: {
            select: { id: true, username: true, firstname: true, image: true },
          },
          market: {
            select: { id: true, question: true, slug: true, image: true },
          },
          _count: { select: { members: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.group.count({ where }),
    ]);

    return {
      data: groups.map((g) => this.formatGroupResponse(g)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================
  // FIND USER GROUPS
  // ============================================
  async findUserGroups(userId: number) {
    const [created, memberships] = await Promise.all([
      this.prisma.group.findMany({
        where: { creatorId: userId },
        include: {
          creator: {
            select: { id: true, username: true, firstname: true, image: true },
          },
          market: {
            select: { id: true, question: true, slug: true, image: true },
          },
          _count: { select: { members: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.groupMember.findMany({
        where: { userId, status: MemberStatus.ACTIVE },
        include: {
          group: {
            include: {
              creator: {
                select: {
                  id: true,
                  username: true,
                  firstname: true,
                  image: true,
                },
              },
              market: {
                select: { id: true, question: true, slug: true, image: true },
              },
              _count: { select: { members: true } },
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      }),
    ]);

    return {
      created: created.map((g) => this.formatGroupResponse(g)),
      joined: memberships.map((m) => ({
        ...this.formatGroupResponse(m.group),
        ownershipPercentage: m.ownershipPercentage
          ? parseFloat(m.ownershipPercentage.toString())
          : 0,
        contributionAmount: parseFloat(m.contributionAmount.toString()),
      })),
    };
  }

  // ============================================
  // FIND BY SLUG
  // ============================================
  async findBySlug(slug: string, userId?: number) {
    const group = await this.prisma.group.findUnique({
      where: { slug },
      include: {
        creator: {
          select: { id: true, username: true, firstname: true, image: true },
        },
        market: {
          select: {
            id: true,
            question: true,
            slug: true,
            image: true,
            status: true,
          },
        },
        members: {
          where: { status: MemberStatus.ACTIVE },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstname: true,
                image: true,
              },
            },
          },
          orderBy: { contributionAmount: 'desc' },
        },
        orders: true,
        _count: { select: { members: true, votes: true } },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const response: any = this.formatGroupResponse(group);

    // Add user's membership info if logged in
    if (userId) {
      const membership = group.members.find((m) => m.userId === userId);
      if (membership) {
        response.userMembership = {
          contributionAmount: parseFloat(
            membership.contributionAmount.toString(),
          ),
          ownershipPercentage: membership.ownershipPercentage
            ? parseFloat(membership.ownershipPercentage.toString())
            : 0,
          joinedAt: membership.joinedAt.toISOString(),
        };
      }
      response.isManager = group.creatorId === userId;
      response.isMember = !!membership;
    }

    return response;
  }

  // ============================================
  // JOIN GROUP
  // ============================================
  async join(userId: number, groupId: number, dto: JoinGroupDto) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: { where: { status: MemberStatus.ACTIVE } } },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Validations
    if (group.status !== GroupStatus.OPEN) {
      throw new BadRequestException('Group is not accepting new members');
    }

    if (!group.adminApproved) {
      throw new BadRequestException('Group is pending admin approval');
    }

    if (group.creatorId === userId) {
      throw new BadRequestException(
        'Creator cannot join their own group as member',
      );
    }

    const existingMember = group.members.find((m) => m.userId === userId);
    if (existingMember) {
      throw new BadRequestException('Already a member of this group');
    }

    if (
      group.maxParticipants &&
      group.members.length >= group.maxParticipants
    ) {
      throw new BadRequestException('Group is full');
    }

    const contribution = new Decimal(dto.contributionAmount);

    if (contribution.lt(group.minContribution)) {
      throw new BadRequestException(
        `Minimum contribution is ${group.minContribution}`,
      );
    }

    if (group.maxContribution && contribution.gt(group.maxContribution)) {
      throw new BadRequestException(
        `Maximum contribution is ${group.maxContribution}`,
      );
    }

    // Check user balance
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });

    if (!user || new Decimal(user.balance.toString()).lt(contribution)) {
      throw new BadRequestException('Insufficient balance');
    }

    // Transaction: Join group
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Deduct from user balance
      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: contribution.toNumber() } },
      });

      // 2. Add member
      const member = await tx.groupMember.create({
        data: {
          groupId,
          userId,
          contributionAmount: contribution.toNumber(),
          status: MemberStatus.ACTIVE,
          memberChosenOutcome: dto.memberChosenOutcome,
        },
        include: {
          user: {
            select: { id: true, username: true, firstname: true, image: true },
          },
        },
      });

      // 3. Update group liquidity
      const newLiquidity = new Decimal(group.currentLiquidity.toString()).plus(
        contribution,
      );
      await tx.group.update({
        where: { id: groupId },
        data: { currentLiquidity: newLiquidity.toNumber() },
      });

      // 4. Log transaction
      const newBalance = new Decimal(user.balance.toString()).minus(
        contribution,
      );
      await tx.groupTransaction.create({
        data: {
          groupId,
          userId,
          type: TransactionType.CONTRIBUTION,
          amount: contribution.toNumber(),
          balanceBefore: parseFloat(user.balance.toString()),
          balanceAfter: newBalance.toNumber(),
          description: 'Joined group with contribution',
        },
      });

      // 5. Recalculate ownership percentages
      await this.recalculateOwnership(tx, groupId);

      return member;
    });

    return {
      message: 'Successfully joined the group',
      member: {
        id: result.id,
        contributionAmount: parseFloat(result.contributionAmount.toString()),
        user: result.user,
      },
    };
  }

  // ============================================
  // LEAVE GROUP
  // ============================================
  async leave(userId: number, groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.status !== GroupStatus.OPEN) {
      throw new BadRequestException('Cannot leave group after it is locked');
    }

    const member = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!member || member.status !== MemberStatus.ACTIVE) {
      throw new BadRequestException('Not an active member of this group');
    }

    // Transaction: Leave and refund
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });

      // 1. Refund contribution
      await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: member.contributionAmount } },
      });

      // 2. Update member status
      await tx.groupMember.update({
        where: { id: member.id },
        data: { status: MemberStatus.LEFT, leftAt: new Date() },
      });

      // 3. Update group liquidity
      const newLiquidity = new Decimal(group.currentLiquidity.toString()).minus(
        member.contributionAmount,
      );
      await tx.group.update({
        where: { id: groupId },
        data: { currentLiquidity: newLiquidity.toNumber() },
      });

      // 4. Log transaction
      await tx.groupTransaction.create({
        data: {
          groupId,
          userId,
          type: TransactionType.WITHDRAWAL,
          amount: parseFloat(member.contributionAmount.toString()),
          balanceBefore: parseFloat(user!.balance.toString()),
          balanceAfter: new Decimal(user!.balance.toString())
            .plus(member.contributionAmount)
            .toNumber(),
          description: 'Left group, contribution refunded',
        },
      });

      // 5. Recalculate ownership
      await this.recalculateOwnership(tx, groupId);
    });

    return { message: 'Successfully left the group' };
  }

  // ============================================
  // SUBMIT FOR APPROVAL
  // ============================================
  async submitForApproval(userId: number, groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { market: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.creatorId !== userId) {
      throw new ForbiddenException('Only the manager can submit for approval');
    }

    if (group.status !== GroupStatus.DRAFT) {
      throw new BadRequestException('Group has already been submitted');
    }

    const updatedGroup = await this.prisma.group.update({
      where: { id: groupId },
      data: { status: GroupStatus.PENDING_APPROVAL },
      include: {
        creator: {
          select: { id: true, username: true, firstname: true, image: true },
        },
        market: {
          select: { id: true, question: true, slug: true, image: true },
        },
      },
    });

    // Notify admins about new group pending approval
    const hasProposedMarket = group.market.status === 0;
    const notificationTitle = hasProposedMarket
      ? `New group "${group.name}" with proposed market pending approval`
      : `New group "${group.name}" pending approval`;

    await this.prisma.adminNotification.create({
      data: {
        userId: userId, // User who submitted the group
        title: notificationTitle,
        clickUrl: `/dashboard/grupos?status=1`, // Pending approval filter
      },
    });

    return this.formatGroupResponse(updatedGroup);
  }

  // ============================================
  // LOCK GROUP (Prepare for betting)
  // ============================================
  async lockGroup(userId: number, groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: { where: { status: MemberStatus.ACTIVE } } },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.creatorId !== userId) {
      throw new ForbiddenException('Only the manager can lock the group');
    }

    if (group.status !== GroupStatus.OPEN) {
      throw new BadRequestException('Group is not in open status');
    }

    if (group.members.length === 0) {
      throw new BadRequestException('Cannot lock group with no members');
    }

    const newStatus =
      group.decisionMethod === 1 ? GroupStatus.VOTING : GroupStatus.LOCKED;

    const updatedGroup = await this.prisma.group.update({
      where: { id: groupId },
      data: {
        status: newStatus,
        lockedAt: new Date(),
      },
      include: {
        creator: {
          select: { id: true, username: true, firstname: true, image: true },
        },
        market: {
          select: { id: true, question: true, slug: true, image: true },
        },
      },
    });

    return this.formatGroupResponse(updatedGroup);
  }

  // ============================================
  // SET OUTCOME (Manager decision) - Submits for admin approval
  // ============================================
  async setOutcome(userId: number, groupId: number, outcome: 'YES' | 'NO') {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { creator: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.creatorId !== userId) {
      throw new ForbiddenException('Only the manager can set the outcome');
    }

    if (group.decisionMethod !== 0) {
      throw new BadRequestException('This group uses voting for decisions');
    }

    if (group.status !== GroupStatus.LOCKED) {
      throw new BadRequestException('Group must be locked first');
    }

    const updatedGroup = await this.prisma.group.update({
      where: { id: groupId },
      data: {
        outcomeSelected: outcome,
        status: GroupStatus.AWAITING_RESULT_APPROVAL,
      },
      include: {
        creator: {
          select: { id: true, username: true, firstname: true, image: true },
        },
        market: {
          select: { id: true, question: true, slug: true, image: true },
        },
      },
    });

    // Create admin notification for result approval
    await this.prisma.adminNotification.create({
      data: {
        userId: userId, // Manager who set the outcome
        type: 'group_result_pending',
        title: `Group "${group.name}" result pending approval: ${outcome}`,
        message: `Manager @${group.creator.username} has declared result ${outcome} for group "${group.name}". Please review and approve.`,
        clickUrl: `/dashboard/grupos?status=5`, // Status 5 = AWAITING_RESULT_APPROVAL
        isRead: false,
      },
    });

    return this.formatGroupResponse(updatedGroup);
  }

  // ============================================
  // VOTE
  // ============================================
  async vote(userId: number, groupId: number, outcome: 'YES' | 'NO') {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.decisionMethod !== 1) {
      throw new BadRequestException('This group does not use voting');
    }

    if (group.status !== GroupStatus.VOTING) {
      throw new BadRequestException('Voting is not open');
    }

    const member = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!member || member.status !== MemberStatus.ACTIVE) {
      throw new BadRequestException('You are not a member of this group');
    }

    // Create or update vote
    const vote = await this.prisma.groupVote.upsert({
      where: { groupId_memberId: { groupId, memberId: member.id } },
      create: {
        groupId,
        memberId: member.id,
        outcomeVoted: outcome,
        voteWeight: member.contributionAmount,
      },
      update: {
        outcomeVoted: outcome,
        voteWeight: member.contributionAmount,
        votedAt: new Date(),
      },
    });

    // Calculate vote results
    const votes = await this.prisma.groupVote.findMany({
      where: { groupId },
    });

    let yesWeight = new Decimal(0);
    let noWeight = new Decimal(0);

    for (const v of votes) {
      if (v.outcomeVoted === 'YES') {
        yesWeight = yesWeight.plus(v.voteWeight);
      } else {
        noWeight = noWeight.plus(v.voteWeight);
      }
    }

    const totalWeight = yesWeight.plus(noWeight);
    const yesPercent = totalWeight.gt(0)
      ? yesWeight.div(totalWeight).times(100)
      : new Decimal(0);
    const noPercent = totalWeight.gt(0)
      ? noWeight.div(totalWeight).times(100)
      : new Decimal(0);

    return {
      message: 'Vote recorded',
      vote: {
        outcome,
        weight: parseFloat(member.contributionAmount.toString()),
      },
      results: {
        yes: {
          weight: yesWeight.toNumber(),
          percentage: yesPercent.toNumber(),
        },
        no: {
          weight: noWeight.toNumber(),
          percentage: noPercent.toNumber(),
        },
      },
    };
  }

  // ============================================
  // EXECUTE BET
  // ============================================
  async executeBet(userId: number, groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        market: { include: { options: true } },
        members: { where: { status: MemberStatus.ACTIVE } },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.creatorId !== userId) {
      throw new ForbiddenException('Only the manager can execute the bet');
    }

    if (![GroupStatus.LOCKED, GroupStatus.VOTING].includes(group.status)) {
      throw new BadRequestException('Group is not ready for execution');
    }

    // Determine outcome (from manager or voting)
    let finalOutcome = group.outcomeSelected;

    if (group.decisionMethod === 1) {
      // Voting mode - calculate winner
      const votes = await this.prisma.groupVote.findMany({
        where: { groupId },
      });
      let yesWeight = new Decimal(0);
      let noWeight = new Decimal(0);

      for (const v of votes) {
        if (v.outcomeVoted === 'YES') {
          yesWeight = yesWeight.plus(v.voteWeight);
        } else {
          noWeight = noWeight.plus(v.voteWeight);
        }
      }

      finalOutcome = yesWeight.gte(noWeight) ? 'YES' : 'NO';
    }

    if (!finalOutcome) {
      throw new BadRequestException('Outcome not selected');
    }

    // Get market option (assuming single market with YES/NO)
    const marketOption = group.market.options[0];
    if (!marketOption) {
      throw new BadRequestException('Market option not found');
    }

    // Calculate shares
    const totalLiquidity = new Decimal(group.currentLiquidity.toString());
    const yesPool = new Decimal(marketOption.yesPool.toString());
    const noPool = new Decimal(marketOption.noPool.toString());
    const totalPool = yesPool.plus(noPool);

    // Calculate share price based on pool
    const sharePrice =
      finalOutcome === 'YES' ? yesPool.div(totalPool) : noPool.div(totalPool);

    const sharesToPurchase = totalLiquidity.div(
      sharePrice.gt(0) ? sharePrice : new Decimal(0.5),
    );

    // Create the group order
    const order = await this.prisma.$transaction(async (tx) => {
      // 1. Create group order
      const groupOrder = await tx.groupOrder.create({
        data: {
          groupId,
          marketOptionId: marketOption.id,
          outcomeSelected: finalOutcome!,
          orderPrice: sharePrice.toNumber(),
          sharesPurchased: sharesToPurchase.toNumber(),
          totalCost: totalLiquidity.toNumber(),
          status: OrderStatus.FILLED,
          executedAt: new Date(),
        },
      });

      // 2. Update group status
      await tx.group.update({
        where: { id: groupId },
        data: {
          status: GroupStatus.EXECUTED,
          outcomeSelected: finalOutcome,
          executedAt: new Date(),
        },
      });

      return groupOrder;
    });

    return {
      message: 'Bet executed successfully',
      order: {
        id: order.id,
        outcome: order.outcomeSelected,
        shares: parseFloat(order.sharesPurchased.toString()),
        price: parseFloat(order.orderPrice.toString()),
        totalCost: parseFloat(order.totalCost.toString()),
      },
    };
  }

  // ============================================
  // GET MEMBERS
  // ============================================
  async getMembers(groupId: number) {
    const members = await this.prisma.groupMember.findMany({
      where: { groupId, status: MemberStatus.ACTIVE },
      include: {
        user: {
          select: { id: true, username: true, firstname: true, image: true },
        },
      },
      orderBy: { contributionAmount: 'desc' },
    });

    return members.map((m) => ({
      id: m.id,
      user: m.user,
      contributionAmount: parseFloat(m.contributionAmount.toString()),
      ownershipPercentage: m.ownershipPercentage
        ? parseFloat(m.ownershipPercentage.toString()) * 100
        : 0,
      memberChosenOutcome: m.memberChosenOutcome,
      joinedAt: m.joinedAt.toISOString(),
    }));
  }

  // ============================================
  // GET TRANSACTIONS
  // ============================================
  async getTransactions(groupId: number, userId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const member = await this.prisma.groupMember.findFirst({
      where: { groupId, userId },
    });

    // Only show transactions to members or manager
    if (!member && group.creatorId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const transactions = await this.prisma.groupTransaction.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
    });

    const typeNames = [
      'CONTRIBUTION',
      'WITHDRAWAL',
      'REFUND',
      'PAYOUT',
      'MANAGER_FEE',
      'PLATFORM_FEE',
    ];

    return transactions.map((t) => ({
      id: t.id,
      type: typeNames[t.type] || 'UNKNOWN',
      amount: parseFloat(t.amount.toString()),
      description: t.description,
      createdAt: t.createdAt.toISOString(),
    }));
  }

  // ============================================
  // CREATE INVITATION
  // ============================================
  async createInvitation(
    userId: number,
    groupId: number,
    dto: { phoneNumber?: string; email?: string },
  ) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.creatorId !== userId) {
      throw new ForbiddenException('Only the manager can invite members');
    }

    const inviteCode = this.generateInviteCode();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await this.prisma.groupInvitation.create({
      data: {
        groupId,
        invitedById: userId,
        inviteCode,
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        expiresAt,
      },
    });

    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/groups/join/${inviteCode}`;

    // Generate WhatsApp link if phone number provided
    let whatsappLink: string | undefined;
    if (dto.phoneNumber) {
      const message = encodeURIComponent(
        `You're invited to join the group "${group.name}" on Futurus!\n\nClick to join: ${inviteUrl}`,
      );
      whatsappLink = `https://wa.me/${dto.phoneNumber.replace(/\D/g, '')}?text=${message}`;
    }

    return {
      inviteCode: invitation.inviteCode,
      inviteUrl,
      whatsappLink,
      expiresAt: invitation.expiresAt.toISOString(),
    };
  }

  // ============================================
  // GET INVITATION
  // ============================================
  async getInvitation(code: string) {
    const invitation = await this.prisma.groupInvitation.findUnique({
      where: { inviteCode: code },
      include: {
        group: {
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                firstname: true,
                image: true,
              },
            },
            market: {
              select: { id: true, question: true, slug: true, image: true },
            },
            _count: { select: { members: true } },
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 0) {
      throw new BadRequestException(
        'Invitation has already been used or expired',
      );
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Invitation has expired');
    }

    return {
      invitation: {
        id: invitation.id,
        code: invitation.inviteCode,
        expiresAt: invitation.expiresAt.toISOString(),
      },
      group: this.formatGroupResponse(invitation.group),
    };
  }

  // ============================================
  // ACCEPT INVITATION
  // ============================================
  async acceptInvitation(userId: number, code: string, dto: JoinGroupDto) {
    const invitation = await this.prisma.groupInvitation.findUnique({
      where: { inviteCode: code },
      include: { group: true },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 0) {
      throw new BadRequestException('Invitation has already been used');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Invitation has expired');
    }

    // Join the group
    const result = await this.join(userId, invitation.groupId, dto);

    // Mark invitation as accepted
    await this.prisma.groupInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 1, // ACCEPTED
        invitedUserId: userId,
        acceptedAt: new Date(),
      },
    });

    return result;
  }

  // ============================================
  // ADMIN: APPROVE GROUP
  // ============================================
  async approveGroup(adminId: number, groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { market: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.status !== GroupStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Group is not pending approval');
    }

    const hadProposedMarket = group.market.status === 0;

    // If the linked market is in DRAFT status (proposed market), approve it first
    if (hadProposedMarket) {
      await this.prisma.market.update({
        where: { id: group.marketId },
        data: { status: 1 }, // OPEN
      });
    }

    const updatedGroup = await this.prisma.group.update({
      where: { id: groupId },
      data: {
        status: GroupStatus.OPEN,
        adminApproved: true,
        adminApprovedAt: new Date(),
        adminApprovedBy: adminId,
      },
      include: {
        creator: {
          select: { id: true, username: true, firstname: true, image: true },
        },
        market: {
          select: {
            id: true,
            question: true,
            slug: true,
            image: true,
            status: true,
          },
        },
      },
    });

    // Notify the group creator about approval
    const notificationMessage = hadProposedMarket
      ? `Your group "${group.name}" and proposed market have been approved! Your group is now open for members.`
      : `Your group "${group.name}" has been approved! Your group is now open for members.`;

    await this.prisma.notificationLog.create({
      data: {
        userId: group.creatorId,
        senderId: adminId,
        senderType: 'admin',
        notificationType: 'group_approved',
        title: 'Group Approved',
        message: notificationMessage,
        clickUrl: `/dashboard/groups/${group.slug}`,
      },
    });

    return this.formatGroupResponse(updatedGroup);
  }

  // ============================================
  // ADMIN: REJECT GROUP
  // ============================================
  async rejectGroup(adminId: number, groupId: number, reason: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { market: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.status !== GroupStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Group is not pending approval');
    }

    const hadProposedMarket = group.market.status === 0;

    // If there was a proposed market, mark it as cancelled
    if (hadProposedMarket) {
      await this.prisma.market.update({
        where: { id: group.marketId },
        data: { status: 4 }, // CANCELLED status for rejected proposed markets
      });
    }

    const updatedGroup = await this.prisma.group.update({
      where: { id: groupId },
      data: {
        status: GroupStatus.REJECTED,
        rejectionReason: reason,
      },
      include: {
        creator: {
          select: { id: true, username: true, firstname: true, image: true },
        },
        market: {
          select: { id: true, question: true, slug: true, image: true },
        },
      },
    });

    // Notify the group creator about rejection
    const notificationMessage = hadProposedMarket
      ? `Your group "${group.name}" and proposed market have been rejected. Reason: ${reason}`
      : `Your group "${group.name}" has been rejected. Reason: ${reason}`;

    await this.prisma.notificationLog.create({
      data: {
        userId: group.creatorId,
        senderId: adminId,
        senderType: 'admin',
        notificationType: 'group_rejected',
        title: 'Group Rejected',
        message: notificationMessage,
        clickUrl: `/dashboard/groups`,
      },
    });

    return this.formatGroupResponse(updatedGroup);
  }

  // ============================================
  // ADMIN: APPROVE RESULT (executes the bet and releases payment)
  // ============================================
  async approveResult(adminId: number, groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        market: { include: { options: true } },
        members: { where: { status: MemberStatus.ACTIVE } },
        creator: true,
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.status !== GroupStatus.AWAITING_RESULT_APPROVAL) {
      throw new BadRequestException('Group is not awaiting result approval');
    }

    if (!group.outcomeSelected) {
      throw new BadRequestException('No outcome selected');
    }

    // Get market option
    const marketOption = group.market.options[0];
    if (!marketOption) {
      throw new BadRequestException('Market option not found');
    }

    // Calculate shares
    const totalLiquidity = new Decimal(group.currentLiquidity.toString());
    const yesPool = new Decimal(marketOption.yesPool.toString());
    const noPool = new Decimal(marketOption.noPool.toString());
    const totalPool = yesPool.plus(noPool);

    const sharePrice =
      group.outcomeSelected === 'YES'
        ? yesPool.div(totalPool)
        : noPool.div(totalPool);

    const sharesToPurchase = totalLiquidity.div(
      sharePrice.gt(0) ? sharePrice : new Decimal(0.5),
    );

    // Execute the bet transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create group order
      const groupOrder = await tx.groupOrder.create({
        data: {
          groupId,
          marketOptionId: marketOption.id,
          outcomeSelected: group.outcomeSelected!,
          orderPrice: sharePrice.toNumber(),
          sharesPurchased: sharesToPurchase.toNumber(),
          totalCost: totalLiquidity.toNumber(),
          status: OrderStatus.FILLED,
          executedAt: new Date(),
        },
      });

      // 2. Update group status to EXECUTED
      const updatedGroup = await tx.group.update({
        where: { id: groupId },
        data: {
          status: GroupStatus.EXECUTED,
          executedAt: new Date(),
          resultApprovedAt: new Date(),
          resultApprovedBy: adminId,
        },
        include: {
          creator: {
            select: { id: true, username: true, firstname: true, image: true },
          },
          market: {
            select: { id: true, question: true, slug: true, image: true },
          },
        },
      });

      return { groupOrder, updatedGroup };
    });

    // Notify the group creator about result approval
    await this.prisma.notificationLog.create({
      data: {
        userId: group.creatorId,
        senderId: adminId,
        senderType: 'admin',
        notificationType: 'group_result_approved',
        title: 'Result Approved',
        message: `Your group "${group.name}" result (${group.outcomeSelected}) has been approved! The bet has been executed.`,
        clickUrl: `/dashboard/groups/${group.slug}`,
      },
    });

    return this.formatGroupResponse(result.updatedGroup);
  }

  // ============================================
  // ADMIN: REJECT RESULT (sends back for revision)
  // ============================================
  async rejectResult(adminId: number, groupId: number, reason: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { creator: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.status !== GroupStatus.AWAITING_RESULT_APPROVAL) {
      throw new BadRequestException('Group is not awaiting result approval');
    }

    // Reset to LOCKED status and clear the outcome
    const updatedGroup = await this.prisma.group.update({
      where: { id: groupId },
      data: {
        status: GroupStatus.LOCKED,
        outcomeSelected: null,
      },
      include: {
        creator: {
          select: { id: true, username: true, firstname: true, image: true },
        },
        market: {
          select: { id: true, question: true, slug: true, image: true },
        },
      },
    });

    // Notify the group creator about result rejection
    await this.prisma.notificationLog.create({
      data: {
        userId: group.creatorId,
        senderId: adminId,
        senderType: 'admin',
        notificationType: 'group_result_rejected',
        title: 'Result Rejected',
        message: `Your group "${group.name}" result has been rejected. Reason: ${reason}. Please submit a new result.`,
        clickUrl: `/dashboard/groups/${group.slug}`,
      },
    });

    return this.formatGroupResponse(updatedGroup);
  }

  // ============================================
  // ADMIN: CANCEL AND REFUND
  // ============================================
  async cancelAndRefund(groupId: number, reason: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: { where: { status: MemberStatus.ACTIVE } } },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (
      [
        GroupStatus.RESOLVED,
        GroupStatus.CANCELLED,
        GroupStatus.REFUNDED,
      ].includes(group.status)
    ) {
      throw new BadRequestException('Group is already resolved or cancelled');
    }

    await this.prisma.$transaction(async (tx) => {
      // Refund each member
      for (const member of group.members) {
        const user = await tx.user.findUnique({ where: { id: member.userId } });

        await tx.user.update({
          where: { id: member.userId },
          data: { balance: { increment: member.contributionAmount } },
        });

        await tx.groupMember.update({
          where: { id: member.id },
          data: { status: MemberStatus.REFUNDED },
        });

        await tx.groupTransaction.create({
          data: {
            groupId,
            userId: member.userId,
            type: TransactionType.REFUND,
            amount: parseFloat(member.contributionAmount.toString()),
            balanceBefore: parseFloat(user!.balance.toString()),
            balanceAfter: new Decimal(user!.balance.toString())
              .plus(member.contributionAmount)
              .toNumber(),
            description: `Refund: ${reason}`,
            metadata: JSON.stringify({ reason }),
          },
        });
      }

      // Cancel pending orders
      await tx.groupOrder.updateMany({
        where: { groupId, status: OrderStatus.PENDING },
        data: { status: OrderStatus.CANCELLED },
      });

      // Update group status
      await tx.group.update({
        where: { id: groupId },
        data: {
          status: GroupStatus.REFUNDED,
          description: `${group.description || ''} | Cancellation: ${reason}`,
        },
      });
    });

    return { message: 'Group cancelled and all contributions refunded' };
  }

  // ============================================
  // ADMIN: GET ALL GROUPS
  // ============================================
  async findAllAdmin(params: {
    status?: number;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { status, page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status !== undefined) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { creator: { username: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [groups, total] = await Promise.all([
      this.prisma.group.findMany({
        where,
        include: {
          creator: {
            select: { id: true, username: true, firstname: true, image: true },
          },
          market: {
            select: { id: true, question: true, slug: true, image: true },
          },
          _count: { select: { members: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.group.count({ where }),
    ]);

    return {
      data: groups.map((g) => this.formatGroupResponse(g)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================
  // ADMIN: GET STATS
  // ============================================
  async getStats() {
    const [total, pending, active, resolved, totalLiquidity] =
      await Promise.all([
        this.prisma.group.count(),
        this.prisma.group.count({
          where: { status: GroupStatus.PENDING_APPROVAL },
        }),
        this.prisma.group.count({
          where: {
            status: {
              in: [GroupStatus.OPEN, GroupStatus.LOCKED, GroupStatus.EXECUTED],
            },
          },
        }),
        this.prisma.group.count({ where: { status: GroupStatus.RESOLVED } }),
        this.prisma.group.aggregate({
          _sum: { currentLiquidity: true },
          where: {
            status: {
              in: [GroupStatus.OPEN, GroupStatus.LOCKED, GroupStatus.EXECUTED],
            },
          },
        }),
      ]);

    return {
      total,
      pending,
      active,
      resolved,
      totalLiquidity: totalLiquidity._sum.currentLiquidity
        ? parseFloat(totalLiquidity._sum.currentLiquidity.toString())
        : 0,
    };
  }

  // ============================================
  // HELPER METHODS
  // ============================================
  private async recalculateOwnership(tx: any, groupId: number) {
    const group = await tx.group.findUnique({
      where: { id: groupId },
      include: { members: { where: { status: MemberStatus.ACTIVE } } },
    });

    const totalLiquidity = new Decimal(group.currentLiquidity.toString());

    if (totalLiquidity.eq(0)) return;

    for (const member of group.members) {
      const ownership = new Decimal(member.contributionAmount.toString()).div(
        totalLiquidity,
      );
      await tx.groupMember.update({
        where: { id: member.id },
        data: { ownershipPercentage: ownership.toNumber() },
      });
    }
  }

  private generateSlug(name: string): string {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString(36)
    );
  }

  private generateMarketSlug(question: string): string {
    return (
      question
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 50) +
      '-' +
      Date.now().toString(36)
    );
  }

  private generateInviteCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  private formatGroupResponse(group: any) {
    const statusNames = [
      'DRAFT',
      'PENDING_APPROVAL',
      'REJECTED',
      'OPEN',
      'LOCKED',
      'VOTING',
      'EXECUTED',
      'RESOLVED',
      'CANCELLED',
      'REFUNDED',
      'AWAITING_RESULT_APPROVAL',
    ];

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      slug: group.slug,
      image: group.image,
      isPublic: group.isPublic,
      inviteCode: group.inviteCode,
      minContribution: parseFloat(group.minContribution?.toString() || '0'),
      maxContribution: group.maxContribution
        ? parseFloat(group.maxContribution.toString())
        : null,
      maxParticipants: group.maxParticipants,
      targetLiquidity: parseFloat(group.targetLiquidity?.toString() || '0'),
      currentLiquidity: parseFloat(group.currentLiquidity?.toString() || '0'),
      managerFeePercent: parseFloat(group.managerFeePercent?.toString() || '0'),
      status: statusNames[group.status] || 'UNKNOWN',
      statusCode: group.status,
      adminApproved: group.adminApproved,
      outcomeSelected: group.outcomeSelected,
      decisionMethod: group.decisionMethod === 0 ? 'MANAGER' : 'VOTING',
      memberCount: group._count?.members ?? group.members?.length ?? 0,
      creator: group.creator,
      market: group.market,
      createdAt: group.createdAt?.toISOString(),
      lockedAt: group.lockedAt?.toISOString(),
      executedAt: group.executedAt?.toISOString(),
      resolvedAt: group.resolvedAt?.toISOString(),
    };
  }
}
