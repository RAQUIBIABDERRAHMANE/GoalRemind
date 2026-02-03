import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pushSubscriptions } from '@/lib/db/schema';
import { pushSubscriptionSchema } from '@/lib/validators';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = pushSubscriptionSchema.parse(body);

    // Check if subscription already exists
    const existing = await db.select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, validatedData.endpoint));

    if (existing.length > 0) {
      return NextResponse.json(existing[0]);
    }

    // Insert new subscription
    const result = await db.insert(pushSubscriptions).values({
      endpoint: validatedData.endpoint,
      p256dh: validatedData.keys.p256dh,
      auth: validatedData.keys.auth,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error('Error saving push subscription:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de l\'abonnement' },
      { status: 500 }
    );
  }
}
