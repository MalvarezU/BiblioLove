import { prisma } from '@/lib/prisma';

// Cancela las reservas activas cuya fecha final de reclamo ya paso.
// Tambien libera los ejemplares reservados para que puedan volver a prestarse.
export async function expirarReservasVencidas() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const vencidas = await prisma.reservation.findMany({
    where: {
      status: 'Activa',
      maxCheckout: { lt: hoy },
    },
    select: { id: true, itemId: true },
  });

  if (vencidas.length === 0) return { count: 0 };

  const ids = vencidas.map((r) => r.id);
  const itemIds = [...new Set(vencidas.map((r) => r.itemId))];

  await prisma.$transaction([
    prisma.reservation.updateMany({
      where: { id: { in: ids } },
      data: { status: 'Cancelada' },
    }),
    prisma.item.updateMany({
      where: { id: { in: itemIds }, status: 'Reservado' },
      data: { status: 'Disponible' },
    }),
  ]);

  return { count: vencidas.length };
}
