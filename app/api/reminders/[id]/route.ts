import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reminders } from '@/lib/db/schema';
import { updateReminderSchema } from '@/lib/validators';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reminderId = parseInt(id);

    if (isNaN(reminderId)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateReminderSchema.parse(body);

    const updateData: any = {
      ...validatedData,
      updatedAt: new Date(),
    };

    if (validatedData.dueAt) {
      updateData.dueAt = new Date(validatedData.dueAt);
    }

    const result = await db.update(reminders)
      .set(updateData)
      .where(eq(reminders.id, reminderId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Rappel non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error('Error updating reminder:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du rappel' },
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
    const reminderId = parseInt(id);

    if (isNaN(reminderId)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const result = await db.delete(reminders)
      .where(eq(reminders.id, reminderId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Rappel non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du rappel' },
      { status: 500 }
    );
  }
}
