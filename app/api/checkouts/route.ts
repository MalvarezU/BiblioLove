import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// POST /api/checkouts - Registra un prestamo por 30 dias (solo ADMIN).
export async function POST(request: NextRequest): Promise<NextResponse> {
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
        { error: 'Solo un administrador puede registrar préstamos' },
        { status: 403 }
      );
    }

    const { itemId, userId } = await request.json();
    if (!itemId || !userId) {
      return NextResponse.json(
        { error: 'itemId y userId son requeridos' },
        { status: 400 }
      );
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const checkout = await prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({ where: { id: itemId } });
      if (!item || item.deleted || !item.enabled) throw new Error('ITEM_NOT_FOUND');
      if (item.status !== 'Disponible') throw new Error('ITEM_NOT_AVAILABLE');

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || user.deleted || !user.enabled) throw new Error('USER_NOT_FOUND');

      const retraso = await tx.checkout.findFirst({
        where: {
          userId,
          returnDate: null,
          dueDate: { lt: hoy },
        },
        select: { id: true },
      });
      if (retraso) throw new Error('USER_OVERDUE');

      const dueDate = new Date(hoy);
      dueDate.setDate(dueDate.getDate() + 30);

      const created = await tx.checkout.create({
        data: {
          itemId,
          userId,
          checkoutDate: hoy,
          dueDate,
          status: 'Prestado',
        },
      });

      await tx.item.update({
        where: { id: itemId },
        data: { status: 'En préstamo' },
      });

      return created;
    });

    return NextResponse.json({ checkout }, { status: 201 });
  } catch (error: unknown) {
    const message = (error as { message?: string })?.message;
    if (message === 'ITEM_NOT_FOUND') {
      return NextResponse.json({ error: 'Ejemplar no encontrado' }, { status: 404 });
    }
    if (message === 'ITEM_NOT_AVAILABLE') {
      return NextResponse.json(
        { error: 'El ejemplar ya no está disponible' },
        { status: 409 }
      );
    }
    if (message === 'USER_NOT_FOUND') {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    if (message === 'USER_OVERDUE') {
      return NextResponse.json(
        {
          error:
            'El usuario tiene préstamos en retraso y no puede solicitar nuevos préstamos.',
          code: 'USER_OVERDUE',
        },
        { status: 409 }
      );
    }
    console.error('Error creando préstamo:', error);
    return NextResponse.json({ error: 'Error al crear el préstamo' }, { status: 500 });
  }
}
