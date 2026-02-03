# Changelog

All notable changes to GoalRemind will be documented in this file.

## [1.0.0] - 2026-02-03

### 🎉 Initial Release

#### Features

**Reminders Management**
- Create, edit, and delete reminders
- Set title, notes, due date/time, priority (low/medium/high)
- Configure repeat frequency (none/daily/weekly/monthly)
- Mark reminders as done or snooze them (+10 min / +1 hour)
- Filter by: All, Today, Upcoming, Overdue, Completed
- Automatic status tracking (pending/done/snoozed)

**Goals Management**
- Create, edit, and delete goals
- Set title, description, and target date
- Three progress types: percentage, count, checklist
- Track progress with visual progress bars
- Manage goal status: active, paused, done
- Goal detail page with milestones

**Milestones**
- Add milestones to goals
- Check/uncheck milestone completion
- Automatic goal progress updates for checklist-type goals
- Delete milestones

**Dashboard**
- Overview of today's reminders
- List of overdue reminders
- Active goals with progress visualization
- Quick actions to create reminders and goals

**PWA Features**
- Installable as Progressive Web App
- Works offline with service worker caching
- Responsive design (mobile-first)
- App manifest for native-like experience
- Custom app icons and theme colors

**Push Notifications**
- Web Push API integration
- Subscribe/unsubscribe to notifications
- Test notification button
- VAPID authentication
- Persistent push subscriptions in database

**Automated Notification System**
- Background job to send due reminders
- Configurable check interval (default: 5 minutes)
- Deduplication system (prevents spam)
- Protected API endpoint with secret token
- VPS cron job support

#### Technical Stack
- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- SQLite with Drizzle ORM
- Zod for validation
- React Hot Toast for notifications
- Web Push for push notifications
- Better SQLite3 for Node.js runtime

#### Database Schema
- `reminders` table with full CRUD
- `goals` table with progress tracking
- `milestones` table with foreign key to goals
- `push_subscriptions` table for push notifications
- Proper timestamps and indexes

#### API Routes
- RESTful API design
- `/api/reminders` - CRUD operations
- `/api/goals` - CRUD operations
- `/api/milestones` - CRUD operations
- `/api/push/subscribe` - Push subscription management
- `/api/push/unsubscribe` - Unsubscribe from push
- `/api/push/test` - Send test notification
- `/api/jobs/send-due-reminders` - Automated job endpoint

#### Documentation
- Comprehensive README with all features
- QUICKSTART guide for fast setup
- SETUP guide with detailed instructions
- DEPLOYMENT checklist for production
- Environment variable templates
- VPS cron job examples

#### Scripts
- Generate VAPID keys for push notifications
- Generate secure job API secrets
- Database migration scripts
- Development and build scripts

### 📦 Deployment
- Node.js runtime support
- SQLite file-based database
- No external paid services required
- Works locally and on VPS
- HTTPS required for production push notifications

### 🔐 Security
- Protected job API endpoint
- VAPID key authentication
- Environment variable configuration
- Secure token generation scripts

### 🎨 UI/UX
- Clean, modern interface
- Responsive mobile design
- Accessible form components
- Toast notifications for feedback
- Modal dialogs for forms
- Priority and status badges
- Progress bars for goals
- Icon-based navigation

### 📱 Browser Support
- Chrome (Desktop & Android)
- Safari (Desktop & iOS)
- Firefox (Desktop & Android)
- Edge (Desktop)
- Requires modern browser with PWA support

---

## Future Enhancements (Roadmap)

- [ ] User authentication and multi-user support
- [ ] Reminder categories and tags
- [ ] Goal templates
- [ ] Statistics and analytics dashboard
- [ ] Export/import data (JSON, CSV)
- [ ] Dark mode theme
- [ ] Reminder sharing between users
- [ ] Mobile native apps (React Native)
- [ ] Calendar integration
- [ ] Voice input for reminders
- [ ] AI-powered goal suggestions
- [ ] Habit tracking
- [ ] Team collaboration features

---

[1.0.0]: https://github.com/yourusername/goalremind/releases/tag/v1.0.0
