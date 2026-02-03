# GoalRemind - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Dashboard   │  │  Reminders   │  │    Goals     │              │
│  │    Page      │  │     Page     │  │     Page     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
│  ┌──────────────┐  ┌─────────────────────────────────┐             │
│  │  Settings    │  │      Navigation Component        │             │
│  │    Page      │  │   (Mobile + Desktop)             │             │
│  └──────────────┘  └─────────────────────────────────┘             │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Service Worker (sw.js)                          │   │
│  │  - Offline Caching                                           │   │
│  │  - Push Notification Handling                                │   │
│  │  - Background Sync                                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                         Next.js App Router                           │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     API Routes                                │  │
│  │                                                               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │  │
│  │  │  /reminders │  │   /goals    │  │ /milestones │         │  │
│  │  │  GET, POST  │  │  GET, POST  │  │ PATCH, DEL  │         │  │
│  │  │ PATCH, DEL  │  │ PATCH, DEL  │  │             │         │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────┐    │  │
│  │  │         Push Notification APIs                       │    │  │
│  │  │  /push/subscribe | /push/unsubscribe | /push/test   │    │  │
│  │  └─────────────────────────────────────────────────────┘    │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────┐    │  │
│  │  │              Job API (Protected)                     │    │  │
│  │  │         /jobs/send-due-reminders                     │    │  │
│  │  └─────────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  Business Logic Layer                         │  │
│  │                                                               │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │  │
│  │  │ Zod Schemas  │  │  Validators  │  │   Helpers    │      │  │
│  │  │ (Validation) │  │              │  │              │      │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Drizzle ORM
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                     │
├─────────────────────────────────────────────────────────────────────┤
│                        SQLite Database                               │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  reminders   │  │    goals     │  │  milestones  │             │
│  │──────────────│  │──────────────│  │──────────────│             │
│  │ id           │  │ id           │  │ id           │             │
│  │ title        │  │ title        │  │ goalId (FK)  │             │
│  │ notes        │  │ description  │  │ title        │             │
│  │ dueAt        │  │ targetDate   │  │ done         │             │
│  │ priority     │  │ status       │  │ createdAt    │             │
│  │ repeat       │  │ progressType │  │ updatedAt    │             │
│  │ status       │  │ progress...  │  └──────────────┘             │
│  │ lastNotified │  │ createdAt    │                                │
│  │ createdAt    │  │ updatedAt    │                                │
│  │ updatedAt    │  └──────────────┘                                │
│  └──────────────┘                                                   │
│                                                                       │
│  ┌──────────────────────────┐                                       │
│  │   push_subscriptions     │                                       │
│  │──────────────────────────│                                       │
│  │ id                       │                                       │
│  │ endpoint                 │                                       │
│  │ p256dh                   │                                       │
│  │ auth                     │                                       │
│  │ createdAt                │                                       │
│  └──────────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Push Notification Service                        │   │
│  │                 (Web Push API)                                │   │
│  │  - Uses VAPID authentication                                 │   │
│  │  - Delivers notifications to browsers                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   Cron Job Service                            │   │
│  │  - Calls /api/jobs/send-due-reminders                        │   │
│  │  - Runs every N minutes (configurable)                       │   │
│  │  - Protected with secret token                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Creating a Reminder

```
User Input → Zod Validation → API Route → Drizzle ORM → SQLite
     ↓                                                       ↓
  Browser ←────────── Toast Notification ←──────── Response
```

### Push Notification Flow

```
1. User enables notifications
   ↓
2. Service Worker registers
   ↓
3. Browser generates subscription
   ↓
4. Subscription saved to DB
   ↓
5. Cron job checks due reminders
   ↓
6. API sends push to Web Push Service
   ↓
7. Service Worker receives push
   ↓
8. Notification displayed to user
```

### Goal Progress Update

```
User updates milestone → API Route → Database
                              ↓
                    Calculate total progress
                              ↓
                    Update goal progress
                              ↓
                    Return updated data
                              ↓
                    UI updates progress bar
```

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **React Hot Toast**: Toast notifications

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Drizzle ORM**: Type-safe SQL query builder
- **Better SQLite3**: Fast, embedded database
- **Zod**: Schema validation
- **Web Push**: Push notification library

### PWA
- **Service Worker**: Offline support & push handling
- **Web App Manifest**: Installation metadata
- **Cache API**: Offline data storage

### Infrastructure
- **Node.js**: Runtime environment
- **SQLite**: File-based database
- **Cron**: Scheduled job execution

## Security Architecture

```
┌─────────────────────────────────────────────┐
│           Security Layers                    │
├─────────────────────────────────────────────┤
│                                              │
│  1. Environment Variables                   │
│     - Secrets not in code                   │
│     - .gitignore protection                 │
│                                              │
│  2. API Route Protection                    │
│     - Token-based authentication            │
│     - Job endpoint requires secret          │
│                                              │
│  3. VAPID Keys                               │
│     - Secure push authentication            │
│     - Public/private key pair               │
│                                              │
│  4. HTTPS (Production)                       │
│     - Encrypted communication               │
│     - Required for push notifications       │
│                                              │
│  5. Input Validation                         │
│     - Zod schema validation                 │
│     - SQL injection prevention (ORM)        │
│                                              │
└─────────────────────────────────────────────┘
```

## Deployment Architecture

### Development
```
Developer Machine
├── Node.js
├── SQLite (./data/goalremind.db)
└── npm run dev (Port 3000)
```

### Production (VPS)
```
VPS Server
├── Node.js (Production)
├── SQLite Database
├── Nginx (Reverse Proxy + SSL)
├── PM2 (Process Manager)
└── Cron (Job Scheduler)
```

### PWA Installation Flow
```
Browser → Manifest → Install Prompt → Service Worker → App Shell
```

## File Structure

```
goalremind/
├── app/                      # Next.js App Router
│   ├── (dashboard)/         # Dashboard group
│   │   ├── page.tsx         # Home
│   │   ├── reminders/       # Reminders pages
│   │   ├── goals/           # Goals pages
│   │   └── settings/        # Settings page
│   ├── api/                 # API routes
│   │   ├── reminders/
│   │   ├── goals/
│   │   ├── milestones/
│   │   ├── push/
│   │   └── jobs/
│   └── layout.tsx           # Root layout
├── components/              # React components
├── lib/                     # Utilities
│   ├── db/                 # Database config
│   └── validators/         # Zod schemas
├── public/                  # Static files
│   ├── manifest.json       # PWA manifest
│   ├── sw.js              # Service worker
│   └── icons/             # App icons
├── scripts/                 # Helper scripts
└── data/                    # SQLite database
```

## Performance Optimizations

- **Next.js App Router**: Automatic code splitting
- **SQLite**: Fast, local database queries
- **Service Worker**: Offline caching
- **Lazy Loading**: Components loaded on demand
- **Optimized Images**: Next.js image optimization
- **Tailwind CSS**: Purged unused styles

## Scalability Considerations

### Current Architecture (Single User)
- SQLite for simplicity
- File-based storage
- Single server deployment

### Future Scaling (Multi-User)
- Migrate to PostgreSQL/MySQL
- Add authentication layer
- Deploy to cloud (Vercel, AWS)
- Add Redis for caching
- WebSocket for real-time updates

---

**Note**: This architecture is designed for personal use and small-scale deployments. For production multi-user applications, consider adding authentication, database replication, and horizontal scaling capabilities.
