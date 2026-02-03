import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reminders, pushSubscriptions } from '@/lib/db/schema';
import { and, eq, lte, gte, or, isNull } from 'drizzle-orm';
import webpush from 'web-push';

export const runtime = 'nodejs';

// Configure web-push
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:test@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export async function POST(request: NextRequest) {
  try {
    // Verify API secret token
    const token = request.nextUrl.searchParams.get('token');
    const expectedToken = process.env.JOB_API_SECRET;

    if (!expectedToken || token !== expectedToken) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: 'Les clés VAPID ne sont pas configurées' },
        { status: 500 }
      );
    }

    // Get notification check interval from env (default 5 minutes)
    const checkMinutes = parseInt(process.env.NOTIFICATION_CHECK_MINUTES || '5');
    const now = new Date();
    const futureTime = new Date(now.getTime() + checkMinutes * 60 * 1000);

    // Find reminders due in the next N minutes that haven't been notified
    const dueReminders = await db.select()
      .from(reminders)
      .where(
        and(
          eq(reminders.status, 'pending'),
          gte(reminders.dueAt, now),
          lte(reminders.dueAt, futureTime),
          or(
            isNull(reminders.lastNotifiedAt),
            lte(reminders.lastNotifiedAt, new Date(now.getTime() - 60 * 60 * 1000)) // Not notified in last hour
          )
        )
      );

    if (dueReminders.length === 0) {
      return NextResponse.json({
        message: 'Aucun rappel à notifier',
        reminders: 0,
      });
    }

    // Get all push subscriptions
    const subscriptions = await db.select().from(pushSubscriptions);

    if (subscriptions.length === 0) {
      return NextResponse.json({
        message: 'Aucun abonnement trouvé',
        reminders: dueReminders.length,
        notifications: 0,
      });
    }

    let totalSent = 0;
    let totalFailed = 0;

    // Send notification for each reminder to all subscribers
    for (const reminder of dueReminders) {
      const payload = JSON.stringify({
        title: '⏰ Rappel',
        body: reminder.title,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: {
          reminderId: reminder.id,
          url: '/',
        },
      });

      const results = await Promise.allSettled(
        subscriptions.map(async (sub) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              payload
            );
            return { success: true };
          } catch (error: any) {
            console.error('Failed to send notification:', error);
            
            // Remove invalid subscriptions
            if (error.statusCode === 410 || error.statusCode === 404) {
              await db.delete(pushSubscriptions)
                .where(eq(pushSubscriptions.endpoint, sub.endpoint));
            }
            
            return { success: false };
          }
        })
      );

      const sent = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
      totalSent += sent;
      totalFailed += results.length - sent;

      // Update lastNotifiedAt
      await db.update(reminders)
        .set({ lastNotifiedAt: now })
        .where(eq(reminders.id, reminder.id));
    }

    return NextResponse.json({
      message: 'Notifications envoyées',
      reminders: dueReminders.length,
      notifications: totalSent,
      failed: totalFailed,
    });
  } catch (error) {
    console.error('Error in send-due-reminders job:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi des notifications' },
      { status: 500 }
    );
  }
}
