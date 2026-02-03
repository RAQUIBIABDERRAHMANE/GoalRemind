# Production Deployment Checklist

## Pre-deployment

- [ ] Generate VAPID keys
- [ ] Generate Job API secret
- [ ] Update `.env.local` with production values
- [ ] Update `VAPID_SUBJECT` with production email
- [ ] Test all features locally
- [ ] Run `npm run build` to check for errors

## Database

- [ ] Run migrations on production database
- [ ] Set up database backup strategy
- [ ] Verify database file permissions

## Environment Variables

Set these on your production server:

```env
DATABASE_URL=./data/goalremind.db
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:production-email@example.com
JOB_API_SECRET=your_production_secret
NOTIFICATION_CHECK_MINUTES=5
NODE_ENV=production
```

## HTTPS Configuration

- [ ] Set up SSL certificate (Let's Encrypt)
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Test HTTPS access
- [ ] Verify PWA manifest loads correctly

## Cron Job Setup

### Option 1: System Cron

```bash
# Edit crontab
crontab -e

# Add job (runs every minute)
* * * * * curl -X POST "https://your-domain.com/api/jobs/send-due-reminders?token=YOUR_SECRET" >> /var/log/goalremind-cron.log 2>&1
```

### Option 2: External Monitoring Service

Use services like:
- EasyCron
- Cron-job.org
- UptimeRobot with webhook

Configure to call:
```
POST https://your-domain.com/api/jobs/send-due-reminders?token=YOUR_SECRET
```

## Performance Optimization

- [ ] Enable gzip compression
- [ ] Configure CDN for static assets (optional)
- [ ] Set up proper caching headers
- [ ] Monitor application logs

## Security

- [ ] Keep `JOB_API_SECRET` secure and random
- [ ] Use different secrets for dev/production
- [ ] Set up firewall rules
- [ ] Enable rate limiting (optional)
- [ ] Regular security updates

## Monitoring

- [ ] Set up application monitoring
- [ ] Monitor cron job execution
- [ ] Check notification delivery rates
- [ ] Monitor database size and performance

## Backup Strategy

- [ ] Daily automated backups of SQLite database
- [ ] Store backups in secure location
- [ ] Test restore procedure
- [ ] Document backup/restore process

## Post-deployment

- [ ] Test PWA installation on mobile
- [ ] Test push notifications
- [ ] Verify cron job is running
- [ ] Check all API endpoints
- [ ] Test on multiple browsers
- [ ] Verify offline functionality

## Rollback Plan

In case of issues:

1. Stop the application
2. Restore previous version
3. Restore database backup if needed
4. Update environment variables
5. Restart application

## Support Contacts

- Technical Support: [your-email]
- Hosting Provider: [provider-name]
- SSL Certificate: [certificate-provider]
