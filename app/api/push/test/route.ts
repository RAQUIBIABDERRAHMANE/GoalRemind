import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pushSubscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
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
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: 'Les clés VAPID ne sont pas configurées' },
        { status: 500 }
      );
    }

    const subscriptions = await db.select().from(pushSubscriptions);

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'Aucun abonnement trouvé' },
        { status: 404 }
      );
    }

    const payload = JSON.stringify({
      title: 'Test de notification',
      body: 'Ceci est une notification de test de GoalRemind!',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
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
          return { success: true, endpoint: sub.endpoint };
        } catch (error: any) {
          console.error('Failed to send to:', sub.endpoint, error);
          
          // Remove invalid subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            await db.delete(pushSubscriptions)
              .where(eq(pushSubscriptions.endpoint, sub.endpoint));
          }
          
          return { success: false, endpoint: sub.endpoint, error: error.message };
        }
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    return NextResponse.json({
      message: `Notifications envoyées: ${successful} réussies, ${failed} échouées`,
      total: results.length,
      successful,
      failed,
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la notification de test' },
      { status: 500 }
    );
  }
}
