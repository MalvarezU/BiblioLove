import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// POST /api/checkouts/[id]/return - Registra la devolucion fisica de un prestamo.
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
        { error: 'Solo un administrador puede recibir devoluciones' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const checkout = await prisma.$transaction(async (tx) => {
      const actual = await tx.checkout.findUnique({
        where: { id },
        include: { item: true },
      });

      if (!actual) throw new Error('CHECKOUT_NOT_FOUND');
      if (actual.returnDate || actual.status !== 'Prestado') {
        throw new Error('CHECKOUT_NOT_ACTIVE');
      }

      const estado =
        hoy.getTime() > new Date(actual.dueDate).getTime()
          ? 'Entregado con retraso'
          : 'Entregado';

      const updated = await tx.checkout.update({
        where: { id },
        data: {
          returnDate: hoy,
          status: estado,
        },
      });

      if (actual.item && !actual.item.deleted) {
        await tx.item.update({
          where: { id: actual.itemId },
          data: { status: 'Disponible' },
        });
      }

      return updated;
    });

    return NextResponse.json({ checkout }, { status: 200 });
  } catch (error: unknown) {
    const message = (error as { message?: string })?.message;
    if (message === 'CHECKOUT_NOT_FOUND') {
      return NextResponse.json({ error: 'Préstamo no encontrado' }, { status: 404 });
    }
    if (message === 'CHECKOUT_NOT_ACTIVE') {
      return NextResponse.json(
        { error: 'El préstamo ya fue entregado' },
        { status: 409 }
      );
    }
    console.error('Error registrando devolución:', error);
    return NextResponse.json(
      { error: 'Error al registrar la devolución' },
      { status: 500 }
    );
  }
}
