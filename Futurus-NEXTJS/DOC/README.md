# Futurus - Next.js Stack

Full-stack prediction market platform built with Next.js, NestJS, and PostgreSQL.

## Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Public-facing web application |
| Backend API | 3001 | NestJS REST API |
| Admin Panel | 3002 | Administration dashboard |
| PostgreSQL | 5432 | Database |

## Admin Credentials

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin123` |
| Email | `admin@futurus.com` |

**Admin Panel URL:** http://localhost:3002

## Quick Start

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Run database migrations
docker exec futurus-backend npx prisma migrate deploy

# Seed the database (creates admin user)
docker exec futurus-backend npx prisma db seed
```

### Using Setup Script

```bash
# Run the setup script
bash setup-futurus.sh

# Follow the prompts:
# - Backup: n (unless you want to backup existing data)
# - Ports: press Enter for defaults
# - Mode: dev (for development) or prod (for production)
# - Erase data: n (to keep existing data)
# - Restore backup: n (unless restoring from backup)
```

## Development

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Admin

```bash
cd admin
npm install
npm run dev
```

## Permissions System

The admin panel includes a role-based permissions system:

### User Roles

- **Super Admin** (`admin` role): Full access to all features, can manage user permissions
- **Staff User** (`user_admin` role): Restricted access based on assigned permissions

### Permission Types

- **Access**: `access` (can view page) or `lock` (cannot access page)
- **Mode**: `read` (view only) or `read_write` (view and edit)

### Managing Permissions

1. Login as Super Admin
2. Navigate to **Permissions** in the sidebar
3. Add users to admin group and configure their access

## Project Structure

```
F-NEXTJS/
├── admin/          # Next.js Admin Panel
├── backend/        # NestJS API Server
├── frontend/       # Next.js Public Website
├── docker-compose.yml
├── setup-futurus.sh
└── README.md
```

## Environment Variables

Each service has its own `.env` file. Copy from `.env.example`:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp admin/.env.example admin/.env
```

## Database

PostgreSQL 15 with Prisma ORM.

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio
```

---

## Authentication & Redirect Flow

The application uses NextAuth.js with credential-based and OAuth (Google/Facebook) authentication. When accessing protected routes, the system preserves the original URL through the authentication flow.

### How Callback URL Works

1. **Unauthenticated Access**: When a user tries to access a protected route (e.g., `/pt/dashboard/groups/my-group`), they are redirected to login with the callback URL preserved:
   ```
   /login?callbackUrl=%2Fdashboard%2Fgroups%2Fmy-group
   ```

2. **After Login**: Upon successful authentication, users are redirected to their original destination instead of the default `/dashboard`.

3. **Registration Flow**: If the user clicks "Create account" from login, the callback URL is preserved through registration and back to login.

4. **OAuth Flow**: Google/Facebook OAuth also supports callback URLs via query parameters.

### Files Involved

| File | Purpose |
|------|---------|
| `frontend/src/app/[locale]/dashboard/layout.tsx` | Captures current path and redirects to login with callbackUrl |
| `frontend/src/app/[locale]/login/page.tsx` | Reads callbackUrl, redirects after login, passes to OAuth |
| `frontend/src/app/[locale]/register/page.tsx` | Preserves callbackUrl through registration flow |
| `frontend/src/app/[locale]/auth/callback/page.tsx` | Handles OAuth callback with redirect URL |

---

## Group Syndicates Feature

Group Syndicates allow users to create collective betting groups on prediction markets.

### Key Features

- **Group Creation**: Users create groups linked to prediction markets
- **Invite System**: Share links for public groups, invite codes for private groups
- **Manager Decision**: Group managers select YES/NO outcome
- **Admin Approval**: All group submissions and results require admin approval
- **Payout Distribution**: Winnings distributed based on contribution percentages

### Group Status Lifecycle

```
DRAFT → PENDING_APPROVAL → OPEN → LOCKED → AWAITING_RESULT_APPROVAL → EXECUTED → RESOLVED
         ↓                   ↓                    ↓
      REJECTED            CANCELLED            (rejected → LOCKED)
```

| Status Code | Name | Description |
|-------------|------|-------------|
| 0 | DRAFT | Initial state, not submitted |
| 1 | PENDING_APPROVAL | Awaiting admin review |
| 2 | REJECTED | Admin rejected the group |
| 3 | OPEN | Accepting member contributions |
| 4 | LOCKED | No more joins, awaiting decision |
| 5 | VOTING | Members voting (if voting method) |
| 6 | EXECUTED | Bet placed on market |
| 7 | RESOLVED | Payouts complete |
| 8 | CANCELLED | Admin cancelled |
| 9 | REFUNDED | All members refunded |
| 10 | AWAITING_RESULT_APPROVAL | Manager declared result, waiting admin |

### Manager Result Declaration Workflow

When the group is locked and the decision method is **MANAGER**, the manager can declare the market result:

```
1. OPEN → Manager clicks "Lock Group" → LOCKED
2. LOCKED → Manager clicks "Declare YES" or "Declare NO" → AWAITING_RESULT_APPROVAL
3. AWAITING_RESULT_APPROVAL → Admin approves → EXECUTED → RESOLVED
```

#### Manager UI (when group is LOCKED)

```
┌─────────────────────────────────────────────────────────────┐
│  Manager Actions                                             │
│                                                              │
│  "Select the result and submit for admin approval:"         │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  Declare YES     │  │   Declare NO     │                 │
│  │  (green button)  │  │   (red button)   │                 │
│  └──────────────────┘  └──────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

After declaring, the UI shows:
```
┌─────────────────────────────────────────────────────────────┐
│  🕐 Result (YES) - Awaiting admin approval                  │
└─────────────────────────────────────────────────────────────┘
```

#### Conditions for Result Declaration

The buttons only appear when ALL conditions are met:
- `group.isManager === true` (user is the group manager)
- `group.status === "LOCKED"` (group has been locked)
- `group.decisionMethod === "MANAGER"` (not voting-based)
- `group.outcomeSelected === null` (result not yet declared)

#### API Endpoint

**POST** `/groups/:id/set-outcome`

```json
{
  "outcome": "YES"  // or "NO"
}
```

#### What Happens After Declaration

1. Group status changes to `AWAITING_RESULT_APPROVAL` (code 10)
2. Admin receives a notification
3. Admin reviews and either:
   - **Approves**: Status → `EXECUTED` → bet is placed → eventually `RESOLVED` with payouts
   - **Rejects**: Status → `LOCKED` (manager can resubmit with different result)

### Share Links Format

**Public Groups:**
```
https://futurus.com.br/{locale}/dashboard/groups/{slug}
Example: https://futurus.com.br/pt/dashboard/groups/palmeiras-fan-club
```

**Private Groups (Invite Code):**
```
https://futurus.com.br/{locale}/dashboard/groups/join/{inviteCode}
Example: https://futurus.com.br/pt/dashboard/groups/join/abc123xy
```

### API Endpoints

#### User Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/groups` | Create new group |
| GET | `/groups` | List public groups |
| GET | `/groups/my` | Get user's groups |
| GET | `/groups/:slug` | Get group details |
| POST | `/groups/:id/join` | Join group |
| POST | `/groups/:id/leave` | Leave group |
| POST | `/groups/:id/lock` | Lock group |
| POST | `/groups/:id/outcome` | Set outcome (manager only) |

#### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/groups` | List all groups |
| POST | `/admin/groups/:id/approve` | Approve group |
| POST | `/admin/groups/:id/reject` | Reject group |
| POST | `/admin/groups/:id/approve-result` | Approve result & execute bet |
| POST | `/admin/groups/:id/reject-result` | Reject result |
| POST | `/admin/groups/:id/cancel` | Cancel & refund |

### Notification System

The system sends notifications for key events:

**To Admin:**
- Group submitted for approval
- Result declared by manager

**To Manager:**
- Group approved/rejected
- Result approved/rejected

---

## Localization

The frontend supports multiple locales: `pt` (Portuguese), `en` (English), `es` (Spanish).

All routes are prefixed with the locale:
```
/pt/dashboard/groups
/en/dashboard/groups
/es/dashboard/groups
```

---

## Documentation

For detailed implementation documentation, see:
- [GROUP_IMPLEMENTATION.md](./GROUP_IMPLEMENTATION.md) - Complete group syndicates workflow

---

*Last updated: March 2026*
