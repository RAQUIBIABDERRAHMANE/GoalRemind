import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reminders } from '@/lib/db/schema';
import { reminderSchema } from '@/lib/validators';
import { eq, and, lt, gte, lte } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter');
    
    let query;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    switch (filter) {
      case 'today':
        query = db.select().from(reminders)
          .where(
            and(
              gte(reminders.dueAt, startOfToday),
              lte(reminders.dueAt, endOfToday),
              eq(reminders.status, 'pending')
            )
          )
          .orderBy(reminders.dueAt);
        break;
      case 'overdue':
        query = db.select().from(reminders)
          .where(
            and(
              lt(reminders.dueAt, now),
              eq(reminders.status, 'pending')
            )
          )
          .orderBy(reminders.dueAt);
        break;
      case 'upcoming':
        query = db.select().from(reminders)
          .where(
            and(
              gte(reminders.dueAt, now),
              eq(reminders.status, 'pending')
            )
          )
          .orderBy(reminders.dueAt);
        break;
      case 'completed':
        query = db.select().from(reminders)
          .where(eq(reminders.status, 'done'))
          .orderBy(sql`${reminders.updatedAt} DESC`);
        break;
      default:
        query = db.select().from(reminders).orderBy(reminders.dueAt);
    }

    const results = await query;
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des rappels' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = reminderSchema.parse(body);

    const result = await db.insert(reminders).values({
      ...validatedData,
      dueAt: new Date(validatedData.dueAt),
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating reminder:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erreur lors de la création du rappel' },
      { status: 500 }
    );
  }
}
