import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// POST /api/reservations - Reserva un ejemplar disponible.
// Un ADMIN puede reservar para cualquier usuario; un USER solo para si mismo.
// Fecha de reclamo: dia siguiente. Fecha final de reclamo: 5 dias despues.
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_user_id')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Sesión requerida' }, { status: 401 });
    }

    const sessionUser = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { id: true, role: true, enabled: true, deleted: true },
    });

    if (!sessionUser || sessionUser.deleted || !sessionUser.enabled) {
      return NextResponse.json({ error: 'Sesión no válida' }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, userId } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'itemId es requerido' }, { status: 400 });
    }

    const targetUserId =
      sessionUser.role === 'ADMIN' && userId ? String(userId) : sessionUser.id;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const reservation = await prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({ where: { id: itemId } });
      if (!item || item.deleted || !item.enabled) throw new Error('ITEM_NOT_FOUND');
      if (item.status !== 'Disponible') throw new Error('ITEM_NOT_AVAILABLE');

      const reservaActiva = await tx.reservation.findFirst({
        where: { itemId, status: 'Activa' },
        select: { id: true },
      });
      if (reservaActiva) throw new Error('ITEM_RESERVED');

      const user = await tx.user.findUnique({ where: { id: targetUserId } });
      if (!user || user.deleted || !user.enabled) throw new Error('USER_NOT_FOUND');

      const retraso = await tx.checkout.findFirst({
        where: {
          userId: targetUserId,
          returnDate: null,
          dueDate: { lt: hoy },
        },
        select: { id: true },
      });
      if (retraso) throw new Error('USER_OVERDUE');

      const minCheckout = new Date(hoy);
      minCheckout.setDate(minCheckout.getDate() + 1);
      const maxCheckout = new Date(minCheckout);
      maxCheckout.setDate(maxCheckout.getDate() + 5);

      const created = await tx.reservation.create({
        data: {
          itemId,
          userId: targetUserId,
          issuedDate: hoy,
          minCheckout,
          maxCheckout,
          status: 'Activa',
        },
      });

      await tx.item.update({
        where: { id: itemId },
        data: { status: 'Reservado' },
      });

      return created;
    });

    return NextResponse.json({ reservation }, { status: 201 });
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
    if (message === 'ITEM_RESERVED') {
      return NextResponse.json(
        { error: 'El ejemplar ya está reservado por otro usuario' },
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
            'El usuario tiene préstamos en retraso y no puede realizar nuevas reservas.',
          code: 'USER_OVERDUE',
        },
        { status: 409 }
      );
    }
    console.error('Error creando reserva:', error);
    return NextResponse.json({ error: 'Error al crear la reserva' }, { status: 500 });
  }
}
