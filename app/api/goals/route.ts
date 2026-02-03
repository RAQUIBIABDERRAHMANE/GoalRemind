import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { goals } from '@/lib/db/schema';
import { goalSchema } from '@/lib/validators';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    let query;
    if (status) {
      query = db.select().from(goals)
        .where(eq(goals.status, status as any))
        .orderBy(sql`${goals.createdAt} DESC`);
    } else {
      query = db.select().from(goals).orderBy(sql`${goals.createdAt} DESC`);
    }

    const results = await query;
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des objectifs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = goalSchema.parse(body);

    const result = await db.insert(goals).values({
      ...validatedData,
      targetDate: validatedData.targetDate ? new Date(validatedData.targetDate) : null,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating goal:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'objectif' },
      { status: 500 }
    );
  }
}
