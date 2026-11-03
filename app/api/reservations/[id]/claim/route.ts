import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// POST /api/reservations/[id]/claim - Hace efectiva una reserva activa.
// Si la fecha final de reclamo ya paso, la reserva se cancela automaticamente.
export async function POST(
  _request: NextRequest,
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
        { error: 'Solo un administrador puede hacer efectiva una reserva' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const result = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id },
        include: { item: true, user: true },
      });

      if (!reservation) throw new Error('RESERVATION_NOT_FOUND');
      if (reservation.status !== 'Activa') throw new Error('RESERVATION_NOT_ACTIVE');

      if (new Date(reservation.maxCheckout).getTime() < hoy.getTime()) {
        await tx.reservation.update({
          where: { id: reservation.id },
          data: { status: 'Cancelada' },
        });
        if (reservation.item && !reservation.item.deleted) {
          await tx.item.update({
            where: { id: reservation.itemId },
            data: { status: 'Disponible' },
          });
        }
        return { expired: true as const };
      }

      if (!reservation.item || reservation.item.deleted || !reservation.item.enabled) {
        throw new Error('ITEM_NOT_FOUND');
      }
      if (!reservation.user || reservation.user.deleted || !reservation.user.enabled) {
        throw new Error('USER_NOT_FOUND');
      }

      const retraso = await tx.checkout.findFirst({
        where: {
          userId: reservation.userId,
          returnDate: null,
          dueDate: { lt: hoy },
        },
        select: { id: true },
      });
      if (retraso) throw new Error('USER_OVERDUE');

      const dueDate = new Date(hoy);
      dueDate.setDate(dueDate.getDate() + 30);

      const checkout = await tx.checkout.create({
        data: {
          itemId: reservation.itemId,
          userId: reservation.userId,
          reservationId: reservation.id,
          checkoutDate: hoy,
          dueDate,
          status: 'Prestado',
        },
      });

      await tx.item.update({
        where: { id: reservation.itemId },
        data: { status: 'En préstamo' },
      });

      await tx.reservation.update({
        where: { id: reservation.id },
        data: { status: 'Reclamado' },
      });

      return { checkout };
    });

    if ('expired' in result) {
      return NextResponse.json(
        {
          error:
            'La fecha final de reclamo ya pasó. La reserva fue cancelada automáticamente.',
          code: 'RESERVATION_EXPIRED',
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ checkout: result.checkout }, { status: 201 });
  } catch (error: unknown) {
    const message = (error as { message?: string })?.message;
    if (message === 'RESERVATION_NOT_FOUND') {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
    }
    if (message === 'RESERVATION_NOT_ACTIVE') {
      return NextResponse.json(
        { error: 'La reserva ya no está activa' },
        { status: 409 }
      );
    }
    if (message === 'ITEM_NOT_FOUND') {
      return NextResponse.json({ error: 'Ejemplar no encontrado' }, { status: 404 });
    }
    if (message === 'USER_NOT_FOUND') {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    if (message === 'USER_OVERDUE') {
      return NextResponse.json(
        {
          error:
            'El usuario tiene préstamos en retraso y no puede reclamar la reserva.',
          code: 'USER_OVERDUE',
        },
        { status: 409 }
      );
    }
    console.error('Error haciendo efectiva la reserva:', error);
    return NextResponse.json(
      { error: 'Error al hacer efectiva la reserva' },
      { status: 500 }
    );
  }
}
