import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// PATCH /api/items/[id] - Actualiza enabled/deleted de un ejemplar (solo ADMIN).
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_user_id')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Sesión requerida' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { role: true, enabled: true, deleted: true },
    });

    if (!admin || admin.deleted || !admin.enabled || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo un administrador puede modificar ejemplares' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    if (body.enabled === undefined && body.deleted === undefined) {
      return NextResponse.json(
        { error: 'enabled o deleted es requerido' },
        { status: 400 }
      );
    }

    const item = await prisma.item.update({
      where: { id },
      data: {
        ...(body.enabled !== undefined && { enabled: Boolean(body.enabled) }),
        ...(body.deleted !== undefined && { deleted: Boolean(body.deleted) }),
      },
    });

    return NextResponse.json({ item }, { status: 200 });
  } catch (error) {
    console.error('Error actualizando ejemplar:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el ejemplar' },
      { status: 500 }
    );
  }
}
