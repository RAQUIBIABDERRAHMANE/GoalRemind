import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { milestones } from '@/lib/db/schema';
import { updateMilestoneSchema } from '@/lib/validators';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const milestoneId = parseInt(id);

    if (isNaN(milestoneId)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateMilestoneSchema.parse(body);

    const result = await db.update(milestones)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(milestones.id, milestoneId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Étape non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error('Error updating milestone:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'étape' },
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
    const milestoneId = parseInt(id);

    if (isNaN(milestoneId)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const result = await db.delete(milestones)
      .where(eq(milestones.id, milestoneId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Étape non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'étape' },
      { status: 500 }
    );
  }
}
