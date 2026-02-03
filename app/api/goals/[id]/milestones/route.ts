import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { milestones } from '@/lib/db/schema';
import { milestoneSchema } from '@/lib/validators';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const goalId = parseInt(id);

    if (isNaN(goalId)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = milestoneSchema.parse({ ...body, goalId });

    const result = await db.insert(milestones).values(validatedData).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating milestone:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'étape' },
      { status: 500 }
    );
  }
}
