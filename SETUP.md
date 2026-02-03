# GoalRemind - Setup Guide

## Quick Start

### 1. Installation

```bash
npm install
```

### 2. Generate VAPID Keys for Push Notifications

```bash
npx tsx scripts/generate-vapid-keys.ts
```

Copy the output to your `.env.local` file.

### 3. Generate Job API Secret

```bash
npx tsx scripts/generate-job-secret.ts
```

Copy the output to your `.env.local` file.

### 4. Create .env.local

```env
DATABASE_URL=./data/goalremind.db

NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com

JOB_API_SECRET=your_secret_token_here

NOTIFICATION_CHECK_MINUTES=5
```

### 5. Setup Database

```bash
npm run db:generate
npm run db:migrate
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Production Deployment

### Build

```bash
npm run build
npm start
```

### VPS Cron Job Setup

Add this to your crontab to check for due reminders every minute:

```bash
* * * * * curl -X POST "https://your-domain.com/api/jobs/send-due-reminders?token=YOUR_SECRET" > /dev/null 2>&1
```

Or every 5 minutes:

```bash
*/5 * * * * curl -X POST "https://your-domain.com/api/jobs/send-due-reminders?token=YOUR_SECRET" > /dev/null 2>&1
```

## PWA Installation

### Chrome Desktop
1. Click the install icon in the address bar
2. Click "Install"

### Chrome Android
1. Open menu (⋮)
2. Select "Add to Home screen"

### Safari iOS
1. Tap Share button
2. Select "Add to Home Screen"

## Enable Push Notifications

1. Go to Settings page
2. Click "Enable notifications"
3. Allow notifications in your browser
4. Test with "Send test notification" button

## Database Management

### View Database with Drizzle Studio

```bash
npm run db:studio
```

### Backup Database

```bash
cp ./data/goalremind.db ./data/goalremind.db.backup
```

## Troubleshooting

### Notifications not working
- Check VAPID keys are correctly set
- Ensure HTTPS in production
- Verify browser permissions

### Database errors
- Run migrations: `npm run db:migrate`
- Check file permissions on ./data directory

### Service Worker issues
- Clear browser cache
- Unregister service worker in DevTools
- Reload page

## Support

Open an issue on GitHub for questions or problems.
