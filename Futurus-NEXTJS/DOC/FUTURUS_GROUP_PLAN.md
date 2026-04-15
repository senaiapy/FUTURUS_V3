# FUTURUS GROUP SYNDICATES - Implementation Plan

## Executive Summary

This document outlines the complete implementation plan for the **Group Syndicates** feature in FUTURUS. This feature allows users to create and join collective betting groups (syndicates) to participate in prediction markets together, pooling their funds and sharing profits/losses proportionally.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Database Architecture](#2-database-architecture)
3. [Backend Implementation](#3-backend-implementation)
4. [Admin Panel Implementation](#4-admin-panel-implementation)
5. [Frontend Implementation](#5-frontend-implementation)
6. [Mobile Implementation](#6-mobile-implementation)
7. [Real-time Features](#7-real-time-features)
8. [Business Logic](#8-business-logic)
9. [Security Considerations](#9-security-considerations)
10. [Testing Strategy](#10-testing-strategy)
11. [Deployment Plan](#11-deployment-plan)

---

## 1. Overview

### 1.1 What is a Group Syndicate?

A Group Syndicate is a collective of users who pool their funds together to place a single, larger bet on a prediction market. The group acts as one "Market Participant," and profits/losses are distributed proportionally based on each member's contribution.

### 1.2 Key Roles

| Role | Description |
|------|-------------|
| **Manager** | The group creator who sets rules, invites members, and chooses the betting outcome |
| **Member** | A user who contributes funds to the group pool |
| **Admin** | Platform administrator who authorizes groups for betting |

### 1.3 Group Lifecycle

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   DRAFT     │───▶│    OPEN     │───▶│   LOCKED    │───▶│  EXECUTED   │───▶│  RESOLVED   │
│  (Created)  │    │ (Accepting) │    │  (Betting)  │    │  (Placed)   │    │  (Payout)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                                      │
       │                  │                  │                                      │
       ▼                  ▼                  ▼                                      ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐                       ┌─────────────┐
│  REJECTED   │    │ CANCELLED   │    │  REFUNDED   │                       │  CANCELLED  │
│  (By Admin) │    │ (By Manager)│    │(Auto/Manual)│                       │(Market Void)│
└─────────────┘    └─────────────┘    └─────────────┘                       └─────────────┘
```

### 1.4 Group Types

| Type | Description | Join Method |
|------|-------------|-------------|
| **Public** | Anyone can view and join | Direct join |
| **Private** | Invitation only | WhatsApp link / Invite code |

---

## 2. Database Architecture

### 2.1 Prisma Schema

Add the following models to `backend/prisma/schema.prisma`:

```prisma
// ============================================
// GROUP SYNDICATES MODELS
// ============================================

model Group {
  id                  String    @id @default(uuid())

  // Relationships
  creatorId           String    @map("creator_id")
  creator             User      @relation("GroupCreator", fields: [creatorId], references: [id])
  marketId            String    @map("market_id")
  market              Market    @relation(fields: [marketId], references: [id])

  // Basic Info
  name                String    @db.VarChar(255)
  description         String?   @db.Text
  slug                String    @unique
  image               String?

  // Privacy & Access
  isPublic            Boolean   @default(true) @map("is_public")
  inviteCode          String?   @unique @map("invite_code")

  // Contribution Limits
  minContribution     Decimal   @default(0) @db.Decimal(18, 8) @map("min_contribution")
  maxContribution     Decimal?  @db.Decimal(18, 8) @map("max_contribution")
  maxParticipants     Int?      @map("max_participants")

  // Liquidity
  targetLiquidity     Decimal   @db.Decimal(18, 8) @map("target_liquidity")
  currentLiquidity    Decimal   @default(0) @db.Decimal(18, 8) @map("current_liquidity")

  // Manager Fee (optional reward for group creator)
  managerFeePercent   Decimal   @default(0) @db.Decimal(5, 4) @map("manager_fee_percent")

  // Status
  status              GroupStatus @default(DRAFT)
  adminApproved       Boolean   @default(false) @map("admin_approved")
  adminApprovedAt     DateTime? @map("admin_approved_at")
  adminApprovedBy     String?   @map("admin_approved_by")
  rejectionReason     String?   @map("rejection_reason")

  // Betting Decision
  outcomeSelected     String?   @map("outcome_selected") // 'YES' or 'NO'
  decisionMethod      DecisionMethod @default(MANAGER) @map("decision_method")

  // Timestamps
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")
  lockedAt            DateTime? @map("locked_at")
  executedAt          DateTime? @map("executed_at")
  resolvedAt          DateTime? @map("resolved_at")
  expiresAt           DateTime? @map("expires_at") // For flash groups

  // Relations
  members             GroupMember[]
  orders              GroupOrder[]
  invitations         GroupInvitation[]
  transactions        GroupTransaction[]
  votes               GroupVote[]

  @@map("groups")
  @@index([creatorId])
  @@index([marketId])
  @@index([status])
  @@index([isPublic])
}

model GroupMember {
  id                  String    @id @default(uuid())

  // Relationships
  groupId             String    @map("group_id")
  group               Group     @relation(fields: [groupId], references: [id], onDelete: Cascade)
  userId              String    @map("user_id")
  user                User      @relation(fields: [userId], references: [id])

  // Contribution
  contributionAmount  Decimal   @db.Decimal(18, 8) @map("contribution_amount")
  ownershipPercentage Decimal?  @db.Decimal(7, 6) @map("ownership_percentage")

  // Status
  status              MemberStatus @default(ACTIVE)

  // Payout Tracking
  payoutAmount        Decimal?  @db.Decimal(18, 8) @map("payout_amount")
  payoutAt            DateTime? @map("payout_at")

  // Timestamps
  joinedAt            DateTime  @default(now()) @map("joined_at")
  leftAt              DateTime? @map("left_at")

  // Votes
  votes               GroupVote[]

  @@unique([groupId, userId])
  @@map("group_members")
  @@index([groupId])
  @@index([userId])
}

model GroupOrder {
  id                  String    @id @default(uuid())

  // Relationships
  groupId             String    @map("group_id")
  group               Group     @relation(fields: [groupId], references: [id])
  marketOptionId      String?   @map("market_option_id")

  // Order Details
  outcomeSelected     String    @map("outcome_selected") // 'YES' or 'NO'
  orderPrice          Decimal   @db.Decimal(18, 8) @map("order_price")
  sharesPurchased     Decimal   @db.Decimal(18, 8) @map("shares_purchased")
  totalCost           Decimal   @db.Decimal(18, 8) @map("total_cost")

  // Status
  status              OrderStatus @default(PENDING)

  // Resolution
  payoutPerShare      Decimal?  @db.Decimal(18, 8) @map("payout_per_share")
  totalPayout         Decimal?  @db.Decimal(18, 8) @map("total_payout")

  // Timestamps
  createdAt           DateTime  @default(now()) @map("created_at")
  executedAt          DateTime? @map("executed_at")
  settledAt           DateTime? @map("settled_at")

  @@map("group_orders")
  @@index([groupId])
}

model GroupInvitation {
  id                  String    @id @default(uuid())

  // Relationships
  groupId             String    @map("group_id")
  group               Group     @relation(fields: [groupId], references: [id], onDelete: Cascade)
  invitedById         String    @map("invited_by_id")
  invitedUserId       String?   @map("invited_user_id") // If registered user

  // Invitation Details
  inviteCode          String    @unique @map("invite_code")
  phoneNumber         String?   @map("phone_number") // For WhatsApp
  email               String?

  // Status
  status              InviteStatus @default(PENDING)

  // Timestamps
  createdAt           DateTime  @default(now()) @map("created_at")
  expiresAt           DateTime  @map("expires_at")
  acceptedAt          DateTime? @map("accepted_at")

  @@map("group_invitations")
  @@index([groupId])
  @@index([inviteCode])
}

model GroupTransaction {
  id                  String    @id @default(uuid())

  // Relationships
  groupId             String    @map("group_id")
  group               Group     @relation(fields: [groupId], references: [id])
  userId              String    @map("user_id")

  // Transaction Details
  type                GroupTransactionType
  amount              Decimal   @db.Decimal(18, 8)
  balanceBefore       Decimal   @db.Decimal(18, 8) @map("balance_before")
  balanceAfter        Decimal   @db.Decimal(18, 8) @map("balance_after")

  // Metadata
  description         String?
  metadata            Json?

  // Timestamps
  createdAt           DateTime  @default(now()) @map("created_at")

  @@map("group_transactions")
  @@index([groupId])
  @@index([userId])
}

model GroupVote {
  id                  String    @id @default(uuid())

  // Relationships
  groupId             String    @map("group_id")
  group               Group     @relation(fields: [groupId], references: [id], onDelete: Cascade)
  memberId            String    @map("member_id")
  member              GroupMember @relation(fields: [memberId], references: [id])

  // Vote Details
  outcomeVoted        String    @map("outcome_voted") // 'YES' or 'NO'
  voteWeight          Decimal   @db.Decimal(18, 8) @map("vote_weight") // Based on contribution

  // Timestamps
  votedAt             DateTime  @default(now()) @map("voted_at")

  @@unique([groupId, memberId])
  @@map("group_votes")
  @@index([groupId])
}

// ============================================
// ENUMS
// ============================================

enum GroupStatus {
  DRAFT           // Created but not submitted for approval
  PENDING_APPROVAL // Waiting for admin approval
  REJECTED        // Admin rejected the group
  OPEN            // Accepting members and contributions
  LOCKED          // No more contributions, waiting for bet placement
  VOTING          // Members voting on outcome (if voting model)
  EXECUTED        // Bet has been placed
  RESOLVED        // Market resolved, payouts distributed
  CANCELLED       // Group cancelled (by manager or system)
  REFUNDED        // All contributions refunded
}

enum MemberStatus {
  ACTIVE
  LEFT
  REFUNDED
  PAID_OUT
}

enum OrderStatus {
  PENDING
  FILLED
  PARTIALLY_FILLED
  CANCELLED
  SETTLED
}

enum InviteStatus {
  PENDING
  ACCEPTED
  EXPIRED
  CANCELLED
}

enum DecisionMethod {
  MANAGER   // Manager decides the outcome
  VOTING    // Members vote (capital-weighted)
}

enum GroupTransactionType {
  CONTRIBUTION      // User adds funds to group
  WITHDRAWAL        // User withdraws before lock
  REFUND            // System refunds on cancellation
  PAYOUT            // Winnings distribution
  MANAGER_FEE       // Fee paid to group creator
  PLATFORM_FEE      // Fee paid to platform
}
```

### 2.2 Update User Model

Add to the existing `User` model:

```prisma
model User {
  // ... existing fields ...

  // Group Relations
  createdGroups       Group[]       @relation("GroupCreator")
  groupMemberships    GroupMember[]

  // ... rest of model ...
}
```

### 2.3 Update Market Model

Add to the existing `Market` model:

```prisma
model Market {
  // ... existing fields ...

  // Group Relations
  groups              Group[]

  // ... rest of model ...
}
```

---

## 3. Backend Implementation

### 3.1 Module Structure

Create the following structure in `backend/src/groups/`:

```
backend/src/groups/
├── groups.module.ts
├── groups.controller.ts
├── groups.service.ts
├── groups.gateway.ts          # WebSocket gateway
├── dto/
│   ├── create-group.dto.ts
│   ├── update-group.dto.ts
│   ├── join-group.dto.ts
│   ├── vote.dto.ts
│   ├── invite-member.dto.ts
│   └── group-response.dto.ts
├── entities/
│   └── group.entity.ts
├── guards/
│   ├── group-manager.guard.ts
│   └── group-member.guard.ts
└── interfaces/
    └── group.interface.ts
```

### 3.2 API Endpoints

#### Public Endpoints (Authenticated Users)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/groups` | List public groups (with filters) |
| `GET` | `/api/groups/:slug` | Get group details |
| `GET` | `/api/groups/my-groups` | List user's groups (created + joined) |
| `GET` | `/api/groups/market/:marketId` | List groups for a specific market |
| `POST` | `/api/groups` | Create a new group |
| `PATCH` | `/api/groups/:id` | Update group (manager only) |
| `DELETE` | `/api/groups/:id` | Delete/cancel group (manager only) |
| `POST` | `/api/groups/:id/join` | Join a group |
| `POST` | `/api/groups/:id/leave` | Leave a group |
| `POST` | `/api/groups/:id/contribute` | Add more contribution |
| `POST` | `/api/groups/:id/submit-approval` | Submit for admin approval |
| `POST` | `/api/groups/:id/lock` | Lock group (manager only) |
| `POST` | `/api/groups/:id/set-outcome` | Set betting outcome (manager only) |
| `POST` | `/api/groups/:id/vote` | Vote for outcome (voting model) |
| `POST` | `/api/groups/:id/execute` | Execute the bet (after lock) |
| `GET` | `/api/groups/:id/members` | List group members |
| `GET` | `/api/groups/:id/transactions` | Group transaction history |
| `POST` | `/api/groups/:id/invite` | Invite member (WhatsApp/email) |
| `GET` | `/api/groups/invite/:code` | Get invitation details |
| `POST` | `/api/groups/invite/:code/accept` | Accept invitation |

#### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/groups` | List all groups (with filters) |
| `GET` | `/api/admin/groups/:id` | Get group details |
| `POST` | `/api/admin/groups/:id/approve` | Approve group |
| `POST` | `/api/admin/groups/:id/reject` | Reject group |
| `POST` | `/api/admin/groups/:id/cancel` | Cancel group (admin) |
| `POST` | `/api/admin/groups/:id/resolve` | Force resolve group |
| `GET` | `/api/admin/groups/stats` | Groups statistics |

### 3.3 Groups Service

```typescript
// backend/src/groups/groups.service.ts

import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { GroupStatus, MemberStatus, GroupTransactionType } from '@prisma/client';
import { Decimal } from 'decimal.js';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // CREATE GROUP
  // ============================================
  async create(userId: string, dto: CreateGroupDto) {
    const market = await this.prisma.market.findUnique({
      where: { id: dto.marketId },
    });

    if (!market) {
      throw new NotFoundException('Market not found');
    }

    if (market.status !== 'OPEN') {
      throw new BadRequestException('Market is not open for betting');
    }

    const slug = this.generateSlug(dto.name);
    const inviteCode = dto.isPublic ? null : this.generateInviteCode();

    const group = await this.prisma.group.create({
      data: {
        creatorId: userId,
        marketId: dto.marketId,
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
        decisionMethod: dto.decisionMethod ?? 'MANAGER',
        status: 'DRAFT',
      },
      include: {
        creator: { select: { id: true, username: true, firstname: true } },
        market: { select: { id: true, question: true, slug: true } },
      },
    });

    return group;
  }

  // ============================================
  // JOIN GROUP
  // ============================================
  async join(userId: string, groupId: string, dto: JoinGroupDto) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Validations
    if (group.status !== 'OPEN') {
      throw new BadRequestException('Group is not accepting new members');
    }

    if (!group.adminApproved) {
      throw new BadRequestException('Group is pending admin approval');
    }

    if (group.creatorId === userId) {
      throw new BadRequestException('Creator cannot join their own group');
    }

    const existingMember = group.members.find(m => m.userId === userId);
    if (existingMember) {
      throw new BadRequestException('Already a member of this group');
    }

    if (group.maxParticipants && group.members.length >= group.maxParticipants) {
      throw new BadRequestException('Group is full');
    }

    const contribution = new Decimal(dto.contributionAmount);

    if (contribution.lt(group.minContribution)) {
      throw new BadRequestException(`Minimum contribution is ${group.minContribution}`);
    }

    if (group.maxContribution && contribution.gt(group.maxContribution)) {
      throw new BadRequestException(`Maximum contribution is ${group.maxContribution}`);
    }

    // Check user balance
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });

    if (new Decimal(user.balance).lt(contribution)) {
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
          status: 'ACTIVE',
        },
      });

      // 3. Update group liquidity
      const newLiquidity = new Decimal(group.currentLiquidity).plus(contribution);
      await tx.group.update({
        where: { id: groupId },
        data: { currentLiquidity: newLiquidity.toNumber() },
      });

      // 4. Log transaction
      await tx.groupTransaction.create({
        data: {
          groupId,
          userId,
          type: 'CONTRIBUTION',
          amount: contribution.toNumber(),
          balanceBefore: user.balance,
          balanceAfter: new Decimal(user.balance).minus(contribution).toNumber(),
          description: 'Joined group with contribution',
        },
      });

      // 5. Recalculate ownership percentages
      await this.recalculateOwnership(tx, groupId);

      return member;
    });

    return result;
  }

  // ============================================
  // LEAVE GROUP
  // ============================================
  async leave(userId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.status !== 'OPEN') {
      throw new BadRequestException('Cannot leave group after it is locked');
    }

    const member = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!member) {
      throw new BadRequestException('Not a member of this group');
    }

    // Transaction: Leave and refund
    await this.prisma.$transaction(async (tx) => {
      // 1. Refund contribution
      await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: member.contributionAmount } },
      });

      // 2. Update member status
      await tx.groupMember.update({
        where: { id: member.id },
        data: { status: 'LEFT', leftAt: new Date() },
      });

      // 3. Update group liquidity
      const newLiquidity = new Decimal(group.currentLiquidity).minus(member.contributionAmount);
      await tx.group.update({
        where: { id: groupId },
        data: { currentLiquidity: newLiquidity.toNumber() },
      });

      // 4. Log transaction
      await tx.groupTransaction.create({
        data: {
          groupId,
          userId,
          type: 'WITHDRAWAL',
          amount: member.contributionAmount,
          balanceBefore: 0, // Will be calculated
          balanceAfter: member.contributionAmount,
          description: 'Left group, contribution refunded',
        },
      });

      // 5. Recalculate ownership
      await this.recalculateOwnership(tx, groupId);
    });

    return { message: 'Successfully left the group' };
  }

  // ============================================
  // LOCK GROUP (Prepare for betting)
  // ============================================
  async lockGroup(userId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: { where: { status: 'ACTIVE' } } },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.creatorId !== userId) {
      throw new ForbiddenException('Only the manager can lock the group');
    }

    if (group.status !== 'OPEN') {
      throw new BadRequestException('Group is not in open status');
    }

    if (group.members.length === 0) {
      throw new BadRequestException('Cannot lock group with no members');
    }

    // Check if minimum liquidity reached (optional)
    // if (new Decimal(group.currentLiquidity).lt(group.targetLiquidity)) {
    //   throw new BadRequestException('Target liquidity not reached');
    // }

    const updatedGroup = await this.prisma.group.update({
      where: { id: groupId },
      data: {
        status: group.decisionMethod === 'VOTING' ? 'VOTING' : 'LOCKED',
        lockedAt: new Date(),
      },
    });

    return updatedGroup;
  }

  // ============================================
  // SET OUTCOME (Manager decision)
  // ============================================
  async setOutcome(userId: string, groupId: string, outcome: 'YES' | 'NO') {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.creatorId !== userId) {
      throw new ForbiddenException('Only the manager can set the outcome');
    }

    if (group.decisionMethod !== 'MANAGER') {
      throw new BadRequestException('This group uses voting for decisions');
    }

    if (group.status !== 'LOCKED') {
      throw new BadRequestException('Group must be locked first');
    }

    const updatedGroup = await this.prisma.group.update({
      where: { id: groupId },
      data: { outcomeSelected: outcome },
    });

    return updatedGroup;
  }

  // ============================================
  // EXECUTE BET
  // ============================================
  async executeBet(userId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        market: true,
        members: { where: { status: 'ACTIVE' } },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.creatorId !== userId) {
      throw new ForbiddenException('Only the manager can execute the bet');
    }

    if (!['LOCKED', 'VOTING'].includes(group.status)) {
      throw new BadRequestException('Group is not ready for execution');
    }

    if (!group.outcomeSelected) {
      throw new BadRequestException('Outcome not selected');
    }

    // Get market option
    const marketOption = await this.prisma.marketOption.findFirst({
      where: {
        marketId: group.marketId,
        // Match YES/NO to option
      },
    });

    // Calculate shares to purchase
    const totalLiquidity = new Decimal(group.currentLiquidity);
    // This would integrate with your market's pricing engine
    const sharePrice = new Decimal(0.5); // Example price
    const sharesToPurchase = totalLiquidity.div(sharePrice);

    // Create the group order
    const order = await this.prisma.$transaction(async (tx) => {
      // 1. Create group order
      const groupOrder = await tx.groupOrder.create({
        data: {
          groupId,
          marketOptionId: marketOption?.id,
          outcomeSelected: group.outcomeSelected,
          orderPrice: sharePrice.toNumber(),
          sharesPurchased: sharesToPurchase.toNumber(),
          totalCost: totalLiquidity.toNumber(),
          status: 'FILLED',
          executedAt: new Date(),
        },
      });

      // 2. Update group status
      await tx.group.update({
        where: { id: groupId },
        data: {
          status: 'EXECUTED',
          executedAt: new Date(),
        },
      });

      // 3. Create purchase in the main system (integrate with existing PurchasesService)
      // This would create the actual market position

      return groupOrder;
    });

    return order;
  }

  // ============================================
  // RESOLVE GROUP (Distribute payouts)
  // ============================================
  async resolveGroup(groupId: string, marketOutcome: string, payoutPerShare: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        orders: { where: { status: 'FILLED' } },
        members: { where: { status: 'ACTIVE' } },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.status !== 'EXECUTED') {
      throw new BadRequestException('Group has not been executed');
    }

    const platformFeePercent = new Decimal(0.02); // 2% platform fee
    const managerFeePercent = new Decimal(group.managerFeePercent);

    await this.prisma.$transaction(async (tx) => {
      // Calculate total winnings
      let totalWinnings = new Decimal(0);

      for (const order of group.orders) {
        if (order.outcomeSelected === marketOutcome) {
          totalWinnings = totalWinnings.plus(
            new Decimal(order.sharesPurchased).times(payoutPerShare)
          );
        }
      }

      if (totalWinnings.eq(0)) {
        // Group lost - just mark as resolved
        await tx.group.update({
          where: { id: groupId },
          data: { status: 'RESOLVED', resolvedAt: new Date() },
        });
        return;
      }

      // Apply fees
      const platformFee = totalWinnings.times(platformFeePercent);
      const managerFee = totalWinnings.times(managerFeePercent);
      const netWinnings = totalWinnings.minus(platformFee).minus(managerFee);

      // Distribute to members
      for (const member of group.members) {
        const shareRatio = new Decimal(member.ownershipPercentage || 0);
        const payout = netWinnings.times(shareRatio);

        // Credit user balance
        await tx.user.update({
          where: { id: member.userId },
          data: { balance: { increment: payout.toNumber() } },
        });

        // Update member payout
        await tx.groupMember.update({
          where: { id: member.id },
          data: {
            payoutAmount: payout.toNumber(),
            payoutAt: new Date(),
            status: 'PAID_OUT',
          },
        });

        // Log transaction
        await tx.groupTransaction.create({
          data: {
            groupId,
            userId: member.userId,
            type: 'PAYOUT',
            amount: payout.toNumber(),
            balanceBefore: 0,
            balanceAfter: payout.toNumber(),
            description: `Payout from group: ${group.name}`,
          },
        });
      }

      // Pay manager fee
      if (managerFee.gt(0)) {
        await tx.user.update({
          where: { id: group.creatorId },
          data: { balance: { increment: managerFee.toNumber() } },
        });

        await tx.groupTransaction.create({
          data: {
            groupId,
            userId: group.creatorId,
            type: 'MANAGER_FEE',
            amount: managerFee.toNumber(),
            balanceBefore: 0,
            balanceAfter: managerFee.toNumber(),
            description: 'Manager fee for group',
          },
        });
      }

      // Update orders
      await tx.groupOrder.updateMany({
        where: { groupId },
        data: { status: 'SETTLED', settledAt: new Date() },
      });

      // Update group status
      await tx.group.update({
        where: { id: groupId },
        data: { status: 'RESOLVED', resolvedAt: new Date() },
      });
    });

    return { message: 'Group resolved and payouts distributed' };
  }

  // ============================================
  // CANCEL AND REFUND
  // ============================================
  async cancelAndRefund(groupId: string, reason: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: { where: { status: 'ACTIVE' } } },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (['RESOLVED', 'CANCELLED', 'REFUNDED'].includes(group.status)) {
      throw new BadRequestException('Group is already resolved or cancelled');
    }

    await this.prisma.$transaction(async (tx) => {
      // Refund each member
      for (const member of group.members) {
        await tx.user.update({
          where: { id: member.userId },
          data: { balance: { increment: member.contributionAmount } },
        });

        await tx.groupMember.update({
          where: { id: member.id },
          data: { status: 'REFUNDED' },
        });

        await tx.groupTransaction.create({
          data: {
            groupId,
            userId: member.userId,
            type: 'REFUND',
            amount: member.contributionAmount,
            balanceBefore: 0,
            balanceAfter: member.contributionAmount,
            description: `Refund: ${reason}`,
            metadata: { reason },
          },
        });
      }

      // Cancel pending orders
      await tx.groupOrder.updateMany({
        where: { groupId, status: 'PENDING' },
        data: { status: 'CANCELLED' },
      });

      // Update group status
      await tx.group.update({
        where: { id: groupId },
        data: {
          status: 'REFUNDED',
          description: `${group.description || ''} | Cancellation: ${reason}`,
        },
      });
    });

    return { message: 'Group cancelled and all contributions refunded' };
  }

  // ============================================
  // HELPER METHODS
  // ============================================
  private async recalculateOwnership(tx: any, groupId: string) {
    const group = await tx.group.findUnique({
      where: { id: groupId },
      include: { members: { where: { status: 'ACTIVE' } } },
    });

    const totalLiquidity = new Decimal(group.currentLiquidity);

    if (totalLiquidity.eq(0)) return;

    for (const member of group.members) {
      const ownership = new Decimal(member.contributionAmount).div(totalLiquidity);
      await tx.groupMember.update({
        where: { id: member.id },
        data: { ownershipPercentage: ownership.toNumber() },
      });
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);
  }

  private generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}
```

### 3.4 Groups Controller

```typescript
// backend/src/groups/groups.controller.ts

import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAll(
    @Query('marketId') marketId?: string,
    @Query('status') status?: string,
    @Query('isPublic') isPublic?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.groupsService.findAll({
      marketId,
      status,
      isPublic: isPublic === 'true',
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }

  @Get('my-groups')
  getMyGroups(@GetUser() user: any) {
    return this.groupsService.findUserGroups(user.id);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.groupsService.findBySlug(slug);
  }

  @Post()
  create(@GetUser() user: any, @Body() dto: CreateGroupDto) {
    return this.groupsService.create(user.id, dto);
  }

  @Patch(':id')
  update(@GetUser() user: any, @Param('id') id: string, @Body() dto: any) {
    return this.groupsService.update(user.id, id, dto);
  }

  @Delete(':id')
  delete(@GetUser() user: any, @Param('id') id: string) {
    return this.groupsService.delete(user.id, id);
  }

  @Post(':id/join')
  join(@GetUser() user: any, @Param('id') id: string, @Body() dto: JoinGroupDto) {
    return this.groupsService.join(user.id, id, dto);
  }

  @Post(':id/leave')
  leave(@GetUser() user: any, @Param('id') id: string) {
    return this.groupsService.leave(user.id, id);
  }

  @Post(':id/submit-approval')
  submitForApproval(@GetUser() user: any, @Param('id') id: string) {
    return this.groupsService.submitForApproval(user.id, id);
  }

  @Post(':id/lock')
  lock(@GetUser() user: any, @Param('id') id: string) {
    return this.groupsService.lockGroup(user.id, id);
  }

  @Post(':id/set-outcome')
  setOutcome(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body('outcome') outcome: 'YES' | 'NO',
  ) {
    return this.groupsService.setOutcome(user.id, id, outcome);
  }

  @Post(':id/vote')
  vote(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body('outcome') outcome: 'YES' | 'NO',
  ) {
    return this.groupsService.vote(user.id, id, outcome);
  }

  @Post(':id/execute')
  execute(@GetUser() user: any, @Param('id') id: string) {
    return this.groupsService.executeBet(user.id, id);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.groupsService.getMembers(id);
  }

  @Get(':id/transactions')
  getTransactions(@Param('id') id: string, @GetUser() user: any) {
    return this.groupsService.getTransactions(id, user.id);
  }

  @Post(':id/invite')
  invite(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() dto: { phoneNumber?: string; email?: string },
  ) {
    return this.groupsService.createInvitation(user.id, id, dto);
  }

  @Get('invite/:code')
  getInvitation(@Param('code') code: string) {
    return this.groupsService.getInvitation(code);
  }

  @Post('invite/:code/accept')
  acceptInvitation(@GetUser() user: any, @Param('code') code: string, @Body() dto: JoinGroupDto) {
    return this.groupsService.acceptInvitation(user.id, code, dto);
  }
}
```

### 3.5 WebSocket Gateway

```typescript
// backend/src/groups/groups.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'groups',
})
export class GroupsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected to groups: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from groups: ${client.id}`);
  }

  @SubscribeMessage('joinGroupRoom')
  handleJoinGroup(client: Socket, groupId: string) {
    client.join(`group:${groupId}`);
    return { event: 'joined', groupId };
  }

  @SubscribeMessage('leaveGroupRoom')
  handleLeaveGroup(client: Socket, groupId: string) {
    client.leave(`group:${groupId}`);
    return { event: 'left', groupId };
  }

  // Emit to all clients in a group room
  emitGroupUpdate(groupId: string, data: any) {
    this.server.to(`group:${groupId}`).emit('groupUpdate', data);
  }

  emitMemberJoined(groupId: string, member: any) {
    this.server.to(`group:${groupId}`).emit('memberJoined', member);
  }

  emitMemberLeft(groupId: string, userId: string) {
    this.server.to(`group:${groupId}`).emit('memberLeft', { userId });
  }

  emitLiquidityUpdate(groupId: string, liquidity: number, target: number) {
    this.server.to(`group:${groupId}`).emit('liquidityUpdate', {
      currentLiquidity: liquidity,
      targetLiquidity: target,
      percentage: (liquidity / target) * 100,
    });
  }

  emitGroupLocked(groupId: string) {
    this.server.to(`group:${groupId}`).emit('groupLocked', { groupId });
  }

  emitGroupExecuted(groupId: string, order: any) {
    this.server.to(`group:${groupId}`).emit('groupExecuted', { groupId, order });
  }

  emitGroupResolved(groupId: string, payouts: any[]) {
    this.server.to(`group:${groupId}`).emit('groupResolved', { groupId, payouts });
  }
}
```

---

## 4. Admin Panel Implementation

### 4.1 Page Structure

```
admin/src/app/dashboard/grupos/
├── page.tsx                    # Groups list
├── [id]/
│   └── page.tsx               # Group details
├── pending/
│   └── page.tsx               # Pending approval
├── active/
│   └── page.tsx               # Active groups
├── resolved/
│   └── page.tsx               # Resolved groups
└── components/
    ├── GroupsTable.tsx
    ├── GroupDetails.tsx
    ├── ApprovalModal.tsx
    └── GroupStats.tsx
```

### 4.2 Groups List Page

```tsx
// admin/src/app/dashboard/grupos/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { UsersRound, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

interface Group {
  id: string;
  name: string;
  slug: string;
  status: string;
  isPublic: boolean;
  currentLiquidity: number;
  targetLiquidity: number;
  memberCount: number;
  creator: { username: string };
  market: { question: string };
  createdAt: string;
  adminApproved: boolean;
}

export default function GruposPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    resolved: 0,
    totalLiquidity: 0,
  });

  useEffect(() => {
    fetchGroups();
    fetchStats();
  }, [filter]);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/admin/groups', {
        params: { status: filter !== 'all' ? filter : undefined },
      });
      setGroups(response.data);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/groups/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const approveGroup = async (id: string) => {
    try {
      await api.post(`/admin/groups/${id}/approve`);
      fetchGroups();
      fetchStats();
    } catch (error) {
      console.error('Failed to approve group:', error);
    }
  };

  const rejectGroup = async (id: string, reason: string) => {
    try {
      await api.post(`/admin/groups/${id}/reject`, { reason });
      fetchGroups();
      fetchStats();
    } catch (error) {
      console.error('Failed to reject group:', error);
    }
  };

  const getStatusBadge = (status: string, approved: boolean) => {
    if (status === 'PENDING_APPROVAL') {
      return <span className="px-2 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400">Pending Approval</span>;
    }
    if (status === 'OPEN') {
      return <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400">Open</span>;
    }
    if (status === 'EXECUTED') {
      return <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">Executed</span>;
    }
    if (status === 'RESOLVED') {
      return <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">Resolved</span>;
    }
    if (status === 'CANCELLED' || status === 'REFUNDED') {
      return <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">{status}</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">{status}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Group Syndicates</h1>
          <p className="text-gray-400">Manage betting groups and syndicates</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-[#1a1c29] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <UsersRound className="w-8 h-8 text-indigo-400" />
            <div>
              <p className="text-gray-400 text-sm">Total Groups</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1c29] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-400" />
            <div>
              <p className="text-gray-400 text-sm">Pending Approval</p>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1c29] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1c29] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-gray-400 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-white">{stats.resolved}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1c29] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-gray-400 text-sm">Total Liquidity</p>
              <p className="text-2xl font-bold text-white">${stats.totalLiquidity.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'PENDING_APPROVAL', 'OPEN', 'EXECUTED', 'RESOLVED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-[#1a1c29] text-gray-400 hover:text-white'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Groups Table */}
      <div className="bg-[#1a1c29] rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0f1117]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Group</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Market</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Manager</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Members</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Liquidity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {groups.map((group) => (
              <tr key={group.id} className="hover:bg-[#0f1117]/50">
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-white">{group.name}</p>
                    <p className="text-xs text-gray-400">
                      {group.isPublic ? 'Public' : 'Private'}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="text-gray-300 text-sm truncate max-w-xs">
                    {group.market.question}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-gray-300">@{group.creator.username}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-white">{group.memberCount}</p>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <p className="text-white">${group.currentLiquidity.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">
                      of ${group.targetLiquidity.toLocaleString()}
                    </p>
                    <div className="w-20 h-1 bg-gray-700 rounded-full mt-1">
                      <div
                        className="h-1 bg-indigo-500 rounded-full"
                        style={{
                          width: `${Math.min((group.currentLiquidity / group.targetLiquidity) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  {getStatusBadge(group.status, group.adminApproved)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    {group.status === 'PENDING_APPROVAL' && (
                      <>
                        <button
                          onClick={() => approveGroup(group.id)}
                          className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => rejectGroup(group.id, 'Rejected by admin')}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <a
                      href={`/dashboard/grupos/${group.id}`}
                      className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30"
                    >
                      View
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 5. Frontend Implementation

### 5.1 Page Structure

```
frontend/src/app/[locale]/dashboard/groups/
├── page.tsx                    # My Groups
├── create/
│   └── page.tsx               # Create Group
├── [slug]/
│   └── page.tsx               # Group Details
├── join/
│   └── [code]/
│       └── page.tsx           # Join via invite
└── components/
    ├── GroupCard.tsx
    ├── CreateGroupForm.tsx
    ├── JoinGroupModal.tsx
    ├── ContributionSlider.tsx
    ├── MembersList.tsx
    ├── GroupProgress.tsx
    └── VotingPanel.tsx
```

### 5.2 Groups Dashboard Page

```tsx
// frontend/src/app/[locale]/dashboard/groups/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Plus, Users, TrendingUp, Clock } from 'lucide-react';
import api from '@/lib/api';

interface Group {
  id: string;
  name: string;
  slug: string;
  status: string;
  isPublic: boolean;
  currentLiquidity: number;
  targetLiquidity: number;
  memberCount: number;
  ownershipPercentage?: number;
  market: { question: string; slug: string };
  isManager: boolean;
}

export default function GroupsPage() {
  const t = useTranslations('groups');
  const [groups, setGroups] = useState<{ created: Group[]; joined: Group[] }>({
    created: [],
    joined: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'created' | 'joined'>('joined');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups/my-groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-emerald-400 bg-emerald-500/20';
      case 'LOCKED': return 'text-amber-400 bg-amber-500/20';
      case 'EXECUTED': return 'text-blue-400 bg-blue-500/20';
      case 'RESOLVED': return 'text-purple-400 bg-purple-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const currentGroups = activeTab === 'created' ? groups.created : groups.joined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-gray-400">{t('subtitle')}</p>
        </div>
        <Link
          href="/dashboard/groups/create"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('createGroup')}
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('joined')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'joined'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {t('joinedGroups')} ({groups.joined.length})
        </button>
        <button
          onClick={() => setActiveTab('created')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'created'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {t('myGroups')} ({groups.created.length})
        </button>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
        </div>
      ) : currentGroups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">{t('noGroups')}</p>
          <Link
            href="/market"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            {t('browseMarkets')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentGroups.map((group) => (
            <Link
              key={group.id}
              href={`/dashboard/groups/${group.slug}`}
              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-indigo-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{group.name}</h3>
                  <p className="text-sm text-gray-400 truncate max-w-[200px]">
                    {group.market.question}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(group.status)}`}>
                  {group.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white">
                    {((group.currentLiquidity / group.targetLiquidity) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{
                      width: `${Math.min((group.currentLiquidity / group.targetLiquidity) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{group.memberCount}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>${group.currentLiquidity.toLocaleString()}</span>
                </div>
                {group.ownershipPercentage && (
                  <div className="flex items-center gap-1 text-indigo-400">
                    <span>{(group.ownershipPercentage * 100).toFixed(1)}% ownership</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 5.3 Create Group Form

```tsx
// frontend/src/app/[locale]/dashboard/groups/create/page.tsx

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';

const createGroupSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  marketId: z.string().uuid(),
  isPublic: z.boolean().default(true),
  minContribution: z.number().min(0).default(0),
  maxContribution: z.number().optional(),
  maxParticipants: z.number().min(2).optional(),
  targetLiquidity: z.number().min(100),
  managerFeePercent: z.number().min(0).max(10).default(0),
  decisionMethod: z.enum(['MANAGER', 'VOTING']).default('MANAGER'),
});

type CreateGroupForm = z.infer<typeof createGroupSchema>;

export default function CreateGroupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const marketId = searchParams.get('marketId');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      marketId: marketId || '',
      isPublic: true,
      minContribution: 10,
      targetLiquidity: 1000,
      managerFeePercent: 2,
      decisionMethod: 'MANAGER',
    },
  });

  const onSubmit = async (data: CreateGroupForm) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/groups', data);
      router.push(`/dashboard/groups/${response.data.slug}`);
    } catch (error: any) {
      console.error('Failed to create group:', error);
      alert(error.response?.data?.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPublic = watch('isPublic');
  const decisionMethod = watch('decisionMethod');

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Create a Group Syndicate</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Group Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Group Name
          </label>
          <input
            {...register('name')}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Crypto Bulls Syndicate"
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description (optional)
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe your group strategy..."
          />
        </div>

        {/* Privacy */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              {...register('isPublic')}
              value="true"
              className="text-indigo-500"
            />
            <span className="text-white">Public</span>
            <span className="text-gray-400 text-sm">(Anyone can join)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              {...register('isPublic')}
              value="false"
              className="text-indigo-500"
            />
            <span className="text-white">Private</span>
            <span className="text-gray-400 text-sm">(Invite only)</span>
          </label>
        </div>

        {/* Contribution Limits */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Minimum Contribution ($)
            </label>
            <input
              type="number"
              {...register('minContribution', { valueAsNumber: true })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Maximum Contribution ($)
            </label>
            <input
              type="number"
              {...register('maxContribution', { valueAsNumber: true })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
              placeholder="No limit"
            />
          </div>
        </div>

        {/* Target & Participants */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Liquidity ($)
            </label>
            <input
              type="number"
              {...register('targetLiquidity', { valueAsNumber: true })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Participants
            </label>
            <input
              type="number"
              {...register('maxParticipants', { valueAsNumber: true })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
              placeholder="Unlimited"
            />
          </div>
        </div>

        {/* Decision Method */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Decision Method
          </label>
          <select
            {...register('decisionMethod')}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
          >
            <option value="MANAGER">Manager Decides</option>
            <option value="VOTING">Member Voting (Capital-weighted)</option>
          </select>
          <p className="text-gray-400 text-sm mt-1">
            {decisionMethod === 'MANAGER'
              ? 'You will choose the betting outcome for the group'
              : 'Members vote on the outcome, weighted by their contribution'}
          </p>
        </div>

        {/* Manager Fee */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Manager Fee (%)
          </label>
          <input
            type="number"
            step="0.1"
            {...register('managerFeePercent', { valueAsNumber: true })}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
          />
          <p className="text-gray-400 text-sm mt-1">
            Your commission from group winnings (0-10%)
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  );
}
```

---

## 6. Mobile Implementation

### 6.1 Screen Structure

```
mobile/src/features/groups/
├── screens/
│   ├── GroupsScreen.tsx       # My Groups list
│   ├── GroupDetailScreen.tsx  # Group details
│   ├── CreateGroupScreen.tsx  # Create group form
│   ├── JoinGroupScreen.tsx    # Join via code
│   └── InviteMembersScreen.tsx
├── components/
│   ├── GroupCard.tsx
│   ├── MembersList.tsx
│   ├── ContributionInput.tsx
│   ├── ProgressBar.tsx
│   └── VotingCard.tsx
└── api/
    └── groups.ts
```

### 6.2 Groups API Hook

```typescript
// mobile/src/api/groups/index.ts

import { createQuery, createMutation } from 'react-query-kit';
import { client } from '../common';

export interface Group {
  id: string;
  name: string;
  slug: string;
  status: string;
  isPublic: boolean;
  currentLiquidity: number;
  targetLiquidity: number;
  memberCount: number;
  ownershipPercentage?: number;
  market: { question: string; slug: string };
  isManager: boolean;
}

export const useMyGroups = createQuery({
  queryKey: ['my-groups'],
  fetcher: async () => {
    const response = await client.get('/groups/my-groups');
    return response.data as { created: Group[]; joined: Group[] };
  },
});

export const useGroup = createQuery({
  queryKey: ['group'],
  fetcher: async (variables: { slug: string }) => {
    const response = await client.get(`/groups/${variables.slug}`);
    return response.data as Group;
  },
});

export const useCreateGroup = createMutation({
  mutationFn: async (data: any) => {
    const response = await client.post('/groups', data);
    return response.data;
  },
});

export const useJoinGroup = createMutation({
  mutationFn: async (variables: { groupId: string; contributionAmount: number }) => {
    const response = await client.post(`/groups/${variables.groupId}/join`, {
      contributionAmount: variables.contributionAmount,
    });
    return response.data;
  },
});

export const useLeaveGroup = createMutation({
  mutationFn: async (groupId: string) => {
    const response = await client.post(`/groups/${groupId}/leave`);
    return response.data;
  },
});
```

---

## 7. Real-time Features

### 7.1 WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `joinGroupRoom` | Client → Server | Subscribe to group updates |
| `leaveGroupRoom` | Client → Server | Unsubscribe from group |
| `groupUpdate` | Server → Client | Group data changed |
| `memberJoined` | Server → Client | New member joined |
| `memberLeft` | Server → Client | Member left the group |
| `liquidityUpdate` | Server → Client | Liquidity changed |
| `groupLocked` | Server → Client | Group is now locked |
| `groupExecuted` | Server → Client | Bet has been placed |
| `groupResolved` | Server → Client | Payouts distributed |
| `voteUpdate` | Server → Client | New vote cast |

### 7.2 Frontend Socket Hook

```typescript
// frontend/src/hooks/useGroupSocket.ts

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useGroupSocket(groupId: string, callbacks: {
  onUpdate?: (data: any) => void;
  onMemberJoined?: (member: any) => void;
  onMemberLeft?: (userId: string) => void;
  onLiquidityUpdate?: (data: { currentLiquidity: number; percentage: number }) => void;
  onLocked?: () => void;
  onExecuted?: (order: any) => void;
  onResolved?: (payouts: any[]) => void;
}) {
  useEffect(() => {
    if (!socket) {
      socket = io(`${process.env.NEXT_PUBLIC_API_URL}/groups`, {
        transports: ['websocket'],
      });
    }

    socket.emit('joinGroupRoom', groupId);

    if (callbacks.onUpdate) socket.on('groupUpdate', callbacks.onUpdate);
    if (callbacks.onMemberJoined) socket.on('memberJoined', callbacks.onMemberJoined);
    if (callbacks.onMemberLeft) socket.on('memberLeft', callbacks.onMemberLeft);
    if (callbacks.onLiquidityUpdate) socket.on('liquidityUpdate', callbacks.onLiquidityUpdate);
    if (callbacks.onLocked) socket.on('groupLocked', callbacks.onLocked);
    if (callbacks.onExecuted) socket.on('groupExecuted', callbacks.onExecuted);
    if (callbacks.onResolved) socket.on('groupResolved', callbacks.onResolved);

    return () => {
      socket?.emit('leaveGroupRoom', groupId);
      socket?.off('groupUpdate');
      socket?.off('memberJoined');
      socket?.off('memberLeft');
      socket?.off('liquidityUpdate');
      socket?.off('groupLocked');
      socket?.off('groupExecuted');
      socket?.off('groupResolved');
    };
  }, [groupId]);
}
```

---

## 8. Business Logic

### 8.1 Auto-Liquidation Cron Job

```typescript
// backend/src/groups/groups.cron.ts

import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GroupsService } from './groups.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupsCronService {
  constructor(
    private groupsService: GroupsService,
    private prisma: PrismaService,
  ) {}

  // Check every 5 minutes for groups that need auto-liquidation
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkAutoLiquidation() {
    const now = new Date();
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

    // Find groups that:
    // 1. Are still OPEN
    // 2. Have a market that starts within 15 minutes
    // 3. Haven't reached target liquidity
    const groupsToCancel = await this.prisma.group.findMany({
      where: {
        status: 'OPEN',
        market: {
          startTime: { lte: fifteenMinutesFromNow },
        },
        currentLiquidity: { lt: this.prisma.group.fields.targetLiquidity },
      },
      include: {
        market: true,
      },
    });

    for (const group of groupsToCancel) {
      await this.groupsService.cancelAndRefund(
        group.id,
        'Target liquidity not reached before market start'
      );
    }
  }

  // Check for market resolutions
  @Cron(CronExpression.EVERY_MINUTE)
  async checkMarketResolutions() {
    // Find executed groups where the market has been resolved
    const groupsToResolve = await this.prisma.group.findMany({
      where: {
        status: 'EXECUTED',
        market: {
          status: 'RESOLVED',
        },
      },
      include: {
        market: {
          include: { options: true },
        },
      },
    });

    for (const group of groupsToResolve) {
      const winningOption = group.market.options.find(o => o.isWinner);
      if (winningOption) {
        await this.groupsService.resolveGroup(
          group.id,
          winningOption.name, // 'YES' or 'NO'
          1.0 // Payout per share (adjust based on your pricing)
        );
      }
    }
  }
}
```

### 8.2 WhatsApp Integration

```typescript
// backend/src/groups/groups.service.ts (addition)

async createWhatsAppInviteLink(groupId: string): Promise<string> {
  const group = await this.prisma.group.findUnique({
    where: { id: groupId },
    include: { market: true },
  });

  if (!group.inviteCode) {
    throw new BadRequestException('Group does not have an invite code');
  }

  const inviteUrl = `${process.env.FRONTEND_URL}/groups/join/${group.inviteCode}`;
  const message = encodeURIComponent(
    `Join my betting group "${group.name}" on Futurus!\n\n` +
    `Market: ${group.market.question}\n` +
    `Target: $${group.targetLiquidity}\n\n` +
    `Click to join: ${inviteUrl}`
  );

  return `https://wa.me/?text=${message}`;
}
```

---

## 9. Security Considerations

### 9.1 Access Control

| Action | Who Can Do It |
|--------|---------------|
| Create group | Any authenticated user |
| Join public group | Any authenticated user |
| Join private group | Users with invite code |
| Leave group | Members (before lock) |
| Lock group | Manager only |
| Set outcome | Manager only (MANAGER decision) |
| Vote | Members (VOTING decision) |
| Execute bet | Manager only |
| Approve/Reject | Platform admin only |
| Cancel group | Manager or admin |
| Force resolve | Admin only |

### 9.2 Financial Safety

1. **Atomic Transactions**: All balance changes wrapped in database transactions
2. **Double-spend Prevention**: Check balance before deducting
3. **Refund Guarantees**: Failed operations trigger automatic refunds
4. **Audit Trail**: All transactions logged with before/after balances
5. **Rate Limiting**: Prevent rapid join/leave abuse
6. **Minimum Balances**: Users cannot contribute more than their balance

### 9.3 Input Validation

- All DTOs validated with class-validator
- Decimal.js for precise financial calculations
- UUID validation for all IDs
- Enum validation for statuses

---

## 10. Testing Strategy

### 10.1 Unit Tests

```typescript
// backend/src/groups/groups.service.spec.ts

describe('GroupsService', () => {
  describe('join', () => {
    it('should allow joining an open group', async () => {});
    it('should reject if group is not open', async () => {});
    it('should reject if user has insufficient balance', async () => {});
    it('should reject if contribution below minimum', async () => {});
    it('should reject if group is full', async () => {});
    it('should correctly calculate ownership percentage', async () => {});
  });

  describe('leave', () => {
    it('should allow leaving before lock', async () => {});
    it('should reject leaving after lock', async () => {});
    it('should refund full contribution', async () => {});
  });

  describe('resolveGroup', () => {
    it('should distribute winnings proportionally', async () => {});
    it('should apply platform fee correctly', async () => {});
    it('should apply manager fee correctly', async () => {});
    it('should handle losing groups gracefully', async () => {});
  });
});
```

### 10.2 Integration Tests

- Test full lifecycle: create → join → lock → execute → resolve
- Test cancellation and refund flow
- Test WebSocket real-time updates
- Test admin approval workflow

### 10.3 E2E Tests

- Test complete user journey across frontend
- Test mobile app flows
- Test admin panel management

---

## 11. Deployment Plan

### 11.1 Phase 1: Database & Backend (Week 1-2)

1. [ ] Add Prisma models and run migration
2. [ ] Implement GroupsModule with all endpoints
3. [ ] Implement WebSocket gateway
4. [ ] Add cron jobs for auto-liquidation
5. [ ] Write unit and integration tests
6. [ ] Update admin permissions system

### 11.2 Phase 2: Admin Panel (Week 3)

1. [ ] Replace placeholder with functional pages
2. [ ] Implement approval/rejection workflow
3. [ ] Add statistics dashboard
4. [ ] Test admin functionality

### 11.3 Phase 3: Frontend (Week 4)

1. [ ] Add Groups menu to dashboard
2. [ ] Implement create group flow
3. [ ] Implement join/leave functionality
4. [ ] Add real-time updates with Socket.io
5. [ ] Implement invitation flow

### 11.4 Phase 4: Mobile (Week 5)

1. [ ] Add Groups tab to navigation
2. [ ] Implement all group screens
3. [ ] Add WebSocket support
4. [ ] Test on iOS and Android

### 11.5 Phase 5: Testing & Launch (Week 6)

1. [ ] Complete E2E testing
2. [ ] Performance testing
3. [ ] Security audit
4. [ ] Soft launch with beta users
5. [ ] Full production release

---

## Appendix A: Translations

Add to translation files:

```json
// en.json
{
  "groups": {
    "title": "My Groups",
    "subtitle": "Manage your betting syndicates",
    "createGroup": "Create Group",
    "joinedGroups": "Joined Groups",
    "myGroups": "Groups I Manage",
    "noGroups": "You haven't joined any groups yet",
    "browseMarkets": "Browse Markets",
    "joinGroup": "Join Group",
    "leaveGroup": "Leave Group",
    "lockGroup": "Lock Group",
    "setOutcome": "Set Outcome",
    "execute": "Execute Bet",
    "inviteMembers": "Invite Members",
    "contribution": "Your Contribution",
    "ownership": "Your Ownership",
    "targetLiquidity": "Target Liquidity",
    "currentLiquidity": "Current Liquidity",
    "members": "Members",
    "manager": "Manager",
    "status": {
      "draft": "Draft",
      "pendingApproval": "Pending Approval",
      "open": "Open",
      "locked": "Locked",
      "executed": "Executed",
      "resolved": "Resolved",
      "cancelled": "Cancelled"
    }
  }
}
```

---

*Document Version: 1.0*
*Created: March 2026*
*Author: Development Team*
