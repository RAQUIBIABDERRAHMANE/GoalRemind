# GoalRemind - Features Overview

## 📋 Reminders

### Create & Manage Reminders
- **Title & Notes**: Add detailed information about your reminders
- **Due Date & Time**: Set precise deadlines
- **Priority Levels**: Low, Medium, High with color-coded badges
- **Repeat Options**: None, Daily, Weekly, Monthly
- **Status Tracking**: Pending, Done, Snoozed

### Actions
- ✅ **Mark as Done**: Complete a reminder with one click
- ⏰ **Snooze**: +10 minutes or +1 hour quick actions
- ✏️ **Edit**: Update any reminder details
- 🗑️ **Delete**: Remove reminders you no longer need

### Smart Filters
- **All**: View all reminders
- **Today**: Focus on today's tasks
- **Upcoming**: See what's coming next
- **Overdue**: Catch up on missed reminders
- **Completed**: Review done tasks

### Visual Design
```
┌─────────────────────────────────────────────┐
│ 🔴 High Priority - Team Meeting             │
│ Today at 14:00                               │
│ [✓] [+10m] [+1h] [Edit] [Delete]            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🟡 Medium Priority - Buy groceries          │
│ Tomorrow at 18:00 | Repeat: Weekly          │
│ [✓] [+10m] [+1h] [Edit] [Delete]            │
└─────────────────────────────────────────────┘
```

---

## 🎯 Goals

### Goal Types
- **Percentage**: Track progress from 0% to 100%
- **Count**: Track numerical progress (e.g., read 12 books)
- **Checklist**: Track completion of milestones

### Goal Management
- **Title & Description**: Define your goals clearly
- **Target Date**: Set deadlines for motivation
- **Status**: Active, Paused, or Done
- **Progress Tracking**: Visual progress bars
- **Milestones**: Break down goals into smaller steps

### Goal Actions
- **Update Progress**: Manually update your progress
- **Pause/Resume**: Take breaks when needed
- **Mark Complete**: Celebrate achievements
- **Add Milestones**: Break down complex goals

### Visual Design
```
┌─────────────────────────────────────────────┐
│ Learn TypeScript                     [Active]│
│                                              │
│ Progression: 65%                             │
│ ████████████████░░░░░░░░                    │
│                                              │
│ Milestones:                                  │
│ ☑ Read documentation                         │
│ ☑ Complete basic tutorial                    │
│ ☐ Build a project                            │
│ ☐ Master advanced concepts                   │
└─────────────────────────────────────────────┘
```

---

## 📊 Dashboard

### Today Panel
- Shows reminders due today
- Highlights overdue items
- Quick access to create new reminders

### Active Goals Panel
- Displays all active goals
- Progress bars for each goal
- Quick navigation to goal details

### Quick Actions
- Create Reminder button
- Create Goal button
- One-click access to all features

### Visual Layout
```
┌─────────────────────────────────────────────┐
│           GoalRemind Dashboard               │
│  [+ Rappel]  [+ Objectif]                   │
├──────────────────┬──────────────────────────┤
│  Today           │  Overdue                 │
│  ─────           │  ────────                │
│  • Meeting 14:00 │  • Call client           │
│  • Buy milk      │  • Submit report         │
│                  │                           │
├──────────────────────────────────────────────┤
│  Active Goals                                │
│  ─────────────                               │
│  Learn TypeScript    [████████░░] 65%       │
│  Read 12 Books       [████░░░░░░] 4/12      │
│  Fitness Challenge   [██████████] 100%      │
└─────────────────────────────────────────────┘
```

---

## 🔔 Push Notifications

### Features
- **Browser Notifications**: Receive alerts even when app is closed
- **Service Worker**: Background notification support
- **VAPID Authentication**: Secure push notifications
- **Test Button**: Verify notifications are working

### Setup Process
1. Go to Settings page
2. Click "Enable notifications"
3. Allow notifications in browser prompt
4. Test with "Send test notification"

### Automated Notifications
- Background job checks for due reminders
- Configurable check interval (default: 5 minutes)
- Deduplication prevents spam
- Runs via cron job on server

### Notification Format
```
┌─────────────────────────────┐
│ ⏰ Rappel                    │
│                              │
│ Team Meeting                 │
│ Starting in 5 minutes        │
│                              │
│         [View] [Close]       │
└─────────────────────────────┘
```

---

## 📱 Progressive Web App (PWA)

### Installation
- **Desktop**: Install from browser address bar
- **Android**: Add to home screen from menu
- **iOS**: Add to home screen via share button

### Offline Support
- App shell cached for offline use
- Service worker handles caching
- Works without internet connection

### Native Features
- Standalone mode (no browser UI)
- Custom app icons
- Splash screen
- Native-like navigation

### App Icon
```
   ┌────────┐
   │   🎯   │
   │GoalRmd │
   └────────┘
```

---

## ⚙️ Settings

### Notification Settings
- Enable/Disable push notifications
- Subscription management
- Test notification sender
- Permission status display

### PWA Information
- Installation instructions for each platform
- App version information
- About section

### Configuration
```
┌─────────────────────────────────────────────┐
│ Settings                                     │
├─────────────────────────────────────────────┤
│                                              │
│ 📱 Application PWA                           │
│ Install GoalRemind as an app                 │
│ [How to install on your device]              │
│                                              │
│ 🔔 Push Notifications                        │
│ ✓ Notifications enabled                     │
│ [Disable] [Test Notification]               │
│                                              │
│ ℹ️ About                                     │
│ GoalRemind v1.0.0                            │
│ Powered by Next.js & SQLite                  │
└─────────────────────────────────────────────┘
```

---

## 🎨 UI Components

### Navigation
- Responsive navigation bar
- Mobile-friendly bottom navigation
- Active route highlighting
- Icon-based menu items

### Forms
- Modal dialogs for create/edit
- Input validation with Zod
- Clear error messages
- Accessible form controls

### Feedback
- Toast notifications for actions
- Loading spinners
- Confirmation dialogs
- Success/error states

### Colors & Badges
- **Priority**: 🔴 High, 🟡 Medium, 🔵 Low
- **Status**: 🟢 Active, 🟡 Paused, 🔵 Done
- **Progress**: Green bars for goals
- **Alerts**: Red for overdue, Blue for today

---

## 🔐 Security & Privacy

### Data Storage
- Local SQLite database
- No external services required
- Your data stays on your server

### API Security
- Protected job endpoints
- Secret token authentication
- VAPID key authentication for push

### Best Practices
- Environment variables for secrets
- Secure key generation scripts
- HTTPS required for production

---

## 📊 Database Schema

### Tables Overview

**reminders**
```
id | title | notes | dueAt | priority | repeat | status | lastNotifiedAt
```

**goals**
```
id | title | description | targetDate | status | progressType | progressCurrent | progressTarget
```

**milestones**
```
id | goalId | title | done | createdAt | updatedAt
```

**push_subscriptions**
```
id | endpoint | p256dh | auth | createdAt
```

---

## 🚀 Performance

- **Fast**: Next.js optimized builds
- **Lightweight**: SQLite database
- **Efficient**: Minimal dependencies
- **Responsive**: Mobile-first design
- **Cached**: Service worker caching

---

## 🌐 Browser Compatibility

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| PWA Install | ✅ | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ✅* | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Offline Mode | ✅ | ✅ | ✅ | ✅ |

*Safari on iOS requires iOS 16.4+

---

## 📈 Use Cases

### Personal Productivity
- Daily task management
- Goal tracking
- Habit formation
- Time management

### Professional
- Meeting reminders
- Project milestones
- Deadline tracking
- Team goals

### Learning
- Study schedules
- Course completion
- Skill development
- Reading goals

### Health & Fitness
- Workout reminders
- Hydration tracking
- Health goals
- Medication reminders

---

**Ready to get started?** Check out [QUICKSTART.md](QUICKSTART.md) for setup instructions!
