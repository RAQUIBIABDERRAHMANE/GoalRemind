import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { goals, milestones } from '@/lib/db/schema';
import { updateGoalSchema } from '@/lib/validators';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET(
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

    const goal = await db.select().from(goals).where(eq(goals.id, goalId));

    if (goal.length === 0) {
      return NextResponse.json(
        { error: 'Objectif non trouvé' },
        { status: 404 }
      );
    }

    const goalMilestones = await db.select().from(milestones)
      .where(eq(milestones.goalId, goalId))
      .orderBy(milestones.createdAt);

    return NextResponse.json({
      ...goal[0],
      milestones: goalMilestones,
    });
  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'objectif' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const validatedData = updateGoalSchema.parse(body);

    const updateData: any = {
      ...validatedData,
      updatedAt: new Date(),
    };

    if (validatedData.targetDate) {
      updateData.targetDate = new Date(validatedData.targetDate);
    }

    const result = await db.update(goals)
      .set(updateData)
      .where(eq(goals.id, goalId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Objectif non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error('Error updating goal:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'objectif' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const result = await db.delete(goals)
      .where(eq(goals.id, goalId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Objectif non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'objectif' },
      { status: 500 }
    );
  }
}
