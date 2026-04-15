# Group Syndicates - Implementation Summary

This document summarizes all the features implemented for the Group Syndicates system.

---

## Table of Contents

1. [Share/Invite Link Feature](#1-shareinvite-link-feature)
2. [Notifications System](#2-notifications-system)
3. [Result Declaration & Admin Approval Flow](#3-result-declaration--admin-approval-flow)
4. [Mobile App Updates](#4-mobile-app-updates)

---

## 1. Share/Invite Link Feature

### Overview
Added the ability for users to share group links for both public and private groups.

### Files Modified

#### Frontend
- **`frontend/src/app/[locale]/dashboard/groups/[slug]/page.tsx`**
  - Added `copyInviteLink()` function that generates appropriate link based on group visibility
  - Public groups: Direct link to group page
  - Private groups: Invite code link (`/dashboard/groups/join/{inviteCode}`)
  - Share button with clipboard copy functionality

#### Mobile
- **`mobile/src/app/(app)/groups/[slug].tsx`**
  - Added `handleCopyInvite()` function for invite code copy
  - Added `handleShareGroup()` function using React Native's Share API
  - Share button available for managers and non-managers (if public or member)

### How It Works
1. **Public Groups**: Share direct link to the group page
2. **Private Groups**: Share invite code link that allows users to join

---

## 2. Notifications System

### Overview
Implemented a complete notification system for both frontend users and admin dashboard.

### Backend Changes

#### Schema Updates (`backend/prisma/schema.prisma`)
```prisma
model AdminNotification {
  id        Int      @id @default(autoincrement())
  userId    Int      @default(0)
  type      String?  @db.VarChar(100)      // NEW
  title     String?  @db.VarChar(255)
  message   String?  @db.Text              // NEW
  isRead    Boolean  @default(false)
  clickUrl  String?  @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(...)
}

model UserNotification {                    // NEW MODEL
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  type      String?  @db.VarChar(100)
  title     String?  @db.VarChar(255)
  message   String?  @db.Text
  data      String?  @db.Text
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(...)
}
```

#### API Endpoints (`backend/src/notifications/`)
- `GET /notifications` - Get user notifications (paginated)
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/:id/read` - Mark as read
- `PATCH /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

### Frontend Implementation

#### Sidebar Menu (`frontend/src/components/dashboard/UserSidebar.tsx`)
- Added Bell icon and "Notificações" menu item
- Links to `/dashboard/notifications`

#### Notifications Page (`frontend/src/app/[locale]/dashboard/notifications/page.tsx`)
- Lists all notifications with pagination
- Mark as read (individual and all)
- Delete notifications
- Click to navigate to related content
- Notification type icons (approval, rejection, invite)

### Admin Implementation

#### Sidebar Menu (`admin/src/components/dashboard/AdminSidebar.tsx`)
- Added Bell icon and "Notifications" menu item

#### Admin Notifications Page (`admin/src/app/dashboard/notifications/page.tsx`)
- Lists admin notifications
- Mark as read functionality
- Delete notifications
- Navigate to related admin pages

### Notification Types
| Type | Description | Icon |
|------|-------------|------|
| `group_approved` | Group was approved | ✓ Green |
| `group_rejected` | Group was rejected | ✗ Red |
| `group_result_approved` | Result was approved | ✓ Green |
| `group_result_rejected` | Result was rejected | ✗ Red |
| `group_invite` | Group invitation | Users Blue |

---

## 3. Result Declaration & Admin Approval Flow

### Overview
Implemented a workflow where the group manager declares a result, which then requires admin approval before executing the bet.

### New Status Added
```typescript
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
  AWAITING_RESULT_APPROVAL: 10,  // NEW
};
```

### Schema Updates (`backend/prisma/schema.prisma`)
```prisma
model Group {
  // ... existing fields ...

  // Result Approval (NEW)
  resultApprovedAt    DateTime? @map("result_approved_at")
  resultApprovedBy    Int?      @map("result_approved_by")
}
```

### Backend Service Methods (`backend/src/groups/groups.service.ts`)

#### `setOutcome()` - Modified
- Now sets status to `AWAITING_RESULT_APPROVAL` instead of keeping `LOCKED`
- Creates admin notification for result approval

```typescript
async setOutcome(userId: number, groupId: number, outcome: 'YES' | 'NO') {
  // ... validation ...

  const updatedGroup = await this.prisma.group.update({
    where: { id: groupId },
    data: {
      outcomeSelected: outcome,
      status: GroupStatus.AWAITING_RESULT_APPROVAL,
    },
  });

  // Create admin notification
  await this.prisma.adminNotification.create({
    data: {
      type: 'group_result_pending',
      title: 'Group Result Pending Approval',
      message: `Group "${group.name}" has submitted result: ${outcome}`,
    },
  });
}
```

#### `approveResult()` - New Method
- Executes the bet (creates group order)
- Updates status to `EXECUTED`
- Records approval metadata
- Notifies group manager

```typescript
async approveResult(adminId: number, groupId: number) {
  // ... validation ...

  // Execute bet transaction
  await this.prisma.$transaction(async (tx) => {
    // Create group order
    await tx.groupOrder.create({ ... });

    // Update group status
    await tx.group.update({
      data: {
        status: GroupStatus.EXECUTED,
        executedAt: new Date(),
        resultApprovedAt: new Date(),
        resultApprovedBy: adminId,
      },
    });
  });

  // Notify manager
  await this.prisma.notificationLog.create({
    data: {
      userId: group.creatorId,
      notificationType: 'group_result_approved',
      title: 'Result Approved',
      message: `Your group result has been approved!`,
    },
  });
}
```

#### `rejectResult()` - New Method
- Resets status back to `LOCKED`
- Clears the outcome selection
- Notifies group manager with rejection reason

```typescript
async rejectResult(adminId: number, groupId: number, reason: string) {
  // Reset to LOCKED status
  await this.prisma.group.update({
    data: {
      status: GroupStatus.LOCKED,
      outcomeSelected: null,
    },
  });

  // Notify manager
  await this.prisma.notificationLog.create({
    data: {
      notificationType: 'group_result_rejected',
      message: `Result rejected. Reason: ${reason}`,
    },
  });
}
```

### Admin Controller Endpoints (`backend/src/admin/admin.controller.ts`)
```typescript
@Post('groups/:id/approve-result')
async approveResult(@Param('id') id: number) { ... }

@Post('groups/:id/reject-result')
async rejectResult(@Param('id') id: number, @Body('reason') reason: string) { ... }
```

### Admin UI (`admin/src/app/dashboard/grupos/[id]/page.tsx`)

#### Status Colors
```typescript
const statusColors = {
  // ... existing ...
  AWAITING_RESULT_APPROVAL: "bg-amber-500/20 text-amber-400",
};
```

#### Result Approval Panel
When `group.status === 10` (AWAITING_RESULT_APPROVAL):
- Shows amber notification panel
- Displays manager's declared result
- "Approve Result & Execute Bet" button
- "Reject Result" button (prompts for reason)

### Workflow Diagram

```
┌─────────────────┐
│  Group LOCKED   │
└────────┬────────┘
         │
         ▼ Manager selects YES/NO
┌─────────────────────────────┐
│ AWAITING_RESULT_APPROVAL    │
│ (Admin notified)            │
└────────┬───────────┬────────┘
         │           │
    Approve      Reject
         │           │
         ▼           ▼
┌──────────┐   ┌──────────┐
│ EXECUTED │   │  LOCKED  │
│(Bet runs)│   │(Resubmit)│
└──────────┘   └──────────┘
```

---

## 4. Mobile App Updates

### Files Modified

#### Group Detail Screen (`mobile/src/app/(app)/groups/[slug].tsx`)

**New Status Color:**
```typescript
const statusColors = {
  // ... existing ...
  AWAITING_RESULT_APPROVAL: { bg: 'rgba(245, 158, 11, 0.2)', text: '#F59E0B' },
};
```

**Manager Actions Updated:**
- When `LOCKED`: Shows YES/NO selection buttons
- When `AWAITING_RESULT_APPROVAL`: Shows amber badge with waiting message

**Share Button for Non-Managers:**
- Available for public groups or group members
- Uses React Native Share API

### Translations Added

#### English (`mobile/src/translations/en.json`)
```json
{
  "groups": {
    "status": {
      "AWAITING_RESULT_APPROVAL": "Awaiting Result Approval"
    },
    "result": "Result",
    "awaiting_admin_approval": "Awaiting Admin Approval",
    "copy_invite": "Copy Invite Link",
    "outcome_set": "Outcome submitted for admin approval",
    // ... more keys
  }
}
```

#### Portuguese (`mobile/src/translations/pt.json`)
```json
{
  "groups": {
    "status": {
      "AWAITING_RESULT_APPROVAL": "Aguardando Aprovação do Resultado"
    },
    "result": "Resultado",
    "awaiting_admin_approval": "Aguardando Aprovação do Admin",
    // ... more keys
  }
}
```

#### Spanish (`mobile/src/translations/es.json`)
```json
{
  "groups": {
    "status": {
      "AWAITING_RESULT_APPROVAL": "Esperando Aprobación del Resultado"
    },
    "result": "Resultado",
    "awaiting_admin_approval": "Esperando Aprobación del Admin",
    // ... more keys
  }
}
```

---

## Database Migration

Run the following commands to apply schema changes:

```bash
# Inside the backend container
docker compose exec backend npx prisma db push
docker compose exec backend npx prisma generate
docker compose exec backend npm run build
```

---

## Testing Checklist

### Share/Invite Link
- [ ] Copy link for public group
- [ ] Copy invite code link for private group
- [ ] Share works on mobile (iOS/Android)

### Notifications
- [ ] Frontend: View notifications list
- [ ] Frontend: Mark as read (single)
- [ ] Frontend: Mark all as read
- [ ] Frontend: Delete notification
- [ ] Admin: View notifications list
- [ ] Admin: Mark as read
- [ ] Admin: Delete notification

### Result Declaration Flow
- [ ] Manager locks group
- [ ] Manager selects YES/NO outcome
- [ ] Status changes to AWAITING_RESULT_APPROVAL
- [ ] Admin receives notification
- [ ] Admin approves → Bet executes, manager notified
- [ ] Admin rejects → Status returns to LOCKED, manager notified
- [ ] Manager can resubmit after rejection

### Mobile
- [ ] AWAITING_RESULT_APPROVAL status displays correctly
- [ ] Share button works for non-managers
- [ ] All translations display correctly (EN/PT/ES)

---

## Summary

| Feature | Frontend | Admin | Mobile | Backend |
|---------|----------|-------|--------|---------|
| Share Link | ✅ | - | ✅ | - |
| Notifications Menu | ✅ | ✅ | - | - |
| Notifications Page | ✅ | ✅ | - | ✅ |
| Result Declaration | ✅ | ✅ | ✅ | ✅ |
| Admin Approval UI | - | ✅ | - | - |
| Approval Notifications | - | - | - | ✅ |

---

## 5. Complete Group Lifecycle Workflow

### Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        GROUP SYNDICATE LIFECYCLE                         │
└─────────────────────────────────────────────────────────────────────────┘

                              USER CREATES GROUP
                                     │
                                     ▼
                            ┌────────────────┐
                            │     DRAFT      │ Status: 0
                            │  (Not visible) │
                            └───────┬────────┘
                                    │
                    Manager clicks "Submit for Approval"
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │   PENDING_APPROVAL      │ Status: 1
                       │  (Admin notification)   │
                       └───────────┬─────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
               Admin Approves                Admin Rejects
                    │                             │
                    ▼                             ▼
            ┌────────────┐                ┌────────────┐
            │    OPEN    │ Status: 3      │  REJECTED  │ Status: 2
            │(Users join)│                │   (End)    │
            └─────┬──────┘                └────────────┘
                  │
      Members join & contribute funds
                  │
      Manager clicks "Lock Group"
                  │
                  ▼
          ┌────────────────┐
          │     LOCKED     │ Status: 4
          │(No more joins) │
          └───────┬────────┘
                  │
                  ├─────────────────────────────────┐
                  │                                 │
        Decision Method: MANAGER          Decision Method: VOTING
                  │                                 │
                  │                                 ▼
                  │                        ┌────────────────┐
                  │                        │     VOTING     │ Status: 5
                  │                        │(Members vote)  │
                  │                        └───────┬────────┘
                  │                                │
                  │                    Voting completes
                  │                                │
                  └────────────────┬───────────────┘
                                   │
                   Manager selects YES or NO
                                   │
                                   ▼
                  ┌─────────────────────────────────┐
                  │   AWAITING_RESULT_APPROVAL      │ Status: 10
                  │      (Admin notification)       │
                  └───────────────┬─────────────────┘
                                  │
                   ┌──────────────┴──────────────┐
                   │                             │
              Admin Approves                Admin Rejects
                   │                             │
                   ▼                             ▼
           ┌────────────┐                ┌────────────┐
           │  EXECUTED  │ Status: 6      │   LOCKED   │ Status: 4
           │ (Bet runs) │                │(Resubmit)  │
           └─────┬──────┘                └────────────┘
                 │
         Market resolves
                 │
                 ▼
         ┌────────────┐
         │  RESOLVED  │ Status: 7
         │ (Payouts)  │
         └────────────┘


            CANCELLATION PATH (Any time before RESOLVED)
            ─────────────────────────────────────────────
                           Admin cancels
                                │
                                ▼
                      ┌─────────────────┐
                      │    CANCELLED    │ Status: 8
                      └────────┬────────┘
                               │
                               ▼
                      ┌─────────────────┐
                      │    REFUNDED     │ Status: 9
                      │ (All refunded)  │
                      └─────────────────┘
```

---

### Step-by-Step Workflow

#### Phase 1: Group Creation

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1.1 | User | Creates group with market selection or proposed market | Group saved with status `DRAFT` |
| 1.2 | User | Clicks "Submit for Approval" | Status → `PENDING_APPROVAL` |
| 1.3 | System | Sends notification to admins | Admin sees notification in dashboard |

#### Phase 2: Admin Approval

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 2.1 | Admin | Reviews group details | Views group in admin panel |
| 2.2a | Admin | Clicks "Approve Group" | Status → `OPEN`, Manager notified |
| 2.2b | Admin | Clicks "Reject Group" + reason | Status → `REJECTED`, Manager notified |

#### Phase 3: Member Recruitment

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 3.1 | Manager | Shares group link (public) or invite code (private) | Link copied to clipboard |
| 3.2 | Members | Click link, enter contribution amount | Balance deducted, joined group |
| 3.3 | System | Recalculates ownership percentages | All members' % updated |

#### Phase 4: Locking & Decision

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 4.1 | Manager | Clicks "Lock Group" | Status → `LOCKED` (or `VOTING` if voting method) |
| 4.2 | Manager | Selects YES or NO outcome | Status → `AWAITING_RESULT_APPROVAL` |
| 4.3 | System | Sends notification to admins | Admin sees "Result Pending" notification |

#### Phase 5: Result Approval

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 5.1 | Admin | Reviews declared result | Views outcome in admin panel |
| 5.2a | Admin | Clicks "Approve Result & Execute Bet" | Bet executed, Status → `EXECUTED`, Manager notified |
| 5.2b | Admin | Clicks "Reject Result" + reason | Status → `LOCKED`, Manager can resubmit |

#### Phase 6: Resolution & Payout

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 6.1 | System | Market resolves (YES or NO wins) | Winning shares calculated |
| 6.2 | System | Distributes payouts to members | Balances updated based on ownership % |
| 6.3 | System | Deducts manager fee (if any) | Manager receives commission |
| 6.4 | System | Updates group status | Status → `RESOLVED` |

---

### Status Reference Table

| Code | Status | Description | Next Possible States |
|------|--------|-------------|---------------------|
| 0 | DRAFT | Initial state, not submitted | PENDING_APPROVAL |
| 1 | PENDING_APPROVAL | Waiting for admin | OPEN, REJECTED |
| 2 | REJECTED | Admin rejected | (End state) |
| 3 | OPEN | Accepting members | LOCKED, CANCELLED |
| 4 | LOCKED | No more joins, awaiting decision | AWAITING_RESULT_APPROVAL, VOTING, CANCELLED |
| 5 | VOTING | Members voting (if voting method) | LOCKED, CANCELLED |
| 6 | EXECUTED | Bet placed on market | RESOLVED, CANCELLED |
| 7 | RESOLVED | Payouts complete | (End state) |
| 8 | CANCELLED | Admin cancelled | REFUNDED |
| 9 | REFUNDED | All members refunded | (End state) |
| 10 | AWAITING_RESULT_APPROVAL | Manager declared, waiting admin | EXECUTED, LOCKED |

---

### Notification Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           NOTIFICATION EVENTS                             │
└──────────────────────────────────────────────────────────────────────────┘

MANAGER → ADMIN NOTIFICATIONS
────────────────────────────────
1. Group submitted for approval
   → Type: group_pending
   → Message: "New group pending approval"

2. Result declared
   → Type: group_result_pending
   → Message: "Group result pending approval: {outcome}"


ADMIN → MANAGER NOTIFICATIONS
────────────────────────────────
1. Group approved
   → Type: group_approved
   → Message: "Your group has been approved!"

2. Group rejected
   → Type: group_rejected
   → Message: "Your group was rejected. Reason: {reason}"

3. Result approved
   → Type: group_result_approved
   → Message: "Result approved! Bet has been executed."

4. Result rejected
   → Type: group_result_rejected
   → Message: "Result rejected. Reason: {reason}. Please resubmit."
```

---

### API Endpoints Summary

#### User Endpoints (`/groups`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/groups` | Create new group |
| GET | `/groups` | List public groups |
| GET | `/groups/my` | Get user's groups |
| GET | `/groups/:slug` | Get group details |
| POST | `/groups/:id/submit` | Submit for approval |
| POST | `/groups/:id/join` | Join group |
| POST | `/groups/:id/leave` | Leave group |
| POST | `/groups/:id/lock` | Lock group |
| POST | `/groups/:id/outcome` | Set outcome |
| POST | `/groups/:id/vote` | Cast vote |

#### Admin Endpoints (`/admin/groups`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/groups` | List all groups |
| GET | `/admin/groups/stats` | Get statistics |
| GET | `/admin/groups/:id` | Get group details |
| POST | `/admin/groups/:id/approve` | Approve group |
| POST | `/admin/groups/:id/reject` | Reject group |
| POST | `/admin/groups/:id/approve-result` | Approve result & execute |
| POST | `/admin/groups/:id/reject-result` | Reject result |
| POST | `/admin/groups/:id/cancel` | Cancel & refund |

#### Notification Endpoints (`/notifications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | Get user notifications |
| GET | `/notifications/unread-count` | Get unread count |
| PATCH | `/notifications/:id/read` | Mark as read |
| PATCH | `/notifications/read-all` | Mark all as read |
| DELETE | `/notifications/:id` | Delete notification |

---

*Last updated: March 2026*
