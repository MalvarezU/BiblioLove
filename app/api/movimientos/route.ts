/**
 * API de Movimientos de Inventario.
 *
 * GET  /api/movimientos?maestroId=...  -> lista los movimientos de un maestro (desc).
 * POST /api/movimientos                -> crea un movimiento y actualiza el saldo del maestro
 *                                        de forma atomica (transaccion Prisma).
 *
 * Reglas de negocio:
 *  - tipo debe ser ENTRADA o SALIDA.
 *  - cantidad debe ser > 0.
 *  - SALIDA no puede superar el saldo disponible del maestro.
 *  - El userId corresponde al usuario en sesion que ejecuta el movimiento.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const maestroId = searchParams.get('maestroId');
  if (!maestroId) {
    return NextResponse.json({ error: 'maestroId es requerido' }, { status: 400 });
  }
  try {
    const movimientos = await prisma.movimiento.findMany({
      where: { maestroId },
      orderBy: { createdAt: 'desc' },
      include: { ejecutadoPor: { select: { name: true, lastName: true } } },
    });
    return NextResponse.json({ movimientos }, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo movimientos:', error);
    return NextResponse.json({ error: 'Error al obtener movimientos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { maestroId, tipo, cantidad, userId } = await request.json();
    if (!maestroId || !tipo || cantidad === undefined || !userId) {
      return NextResponse.json({ error: 'maestroId, tipo, cantidad y userId son requeridos' }, { status: 400 });
    }
    if (tipo !== 'ENTRADA' && tipo !== 'SALIDA') {
      return NextResponse.json({ error: 'Tipo de movimiento invalido' }, { status: 400 });
    }
    const qty = Number(cantidad);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ error: 'La cantidad debe ser mayor a 0' }, { status: 400 });
    }
    const result = await prisma.$transaction(async (tx) => {
      const maestro = await tx.maestro.findUnique({ where: { id: maestroId, deleted: false } });
      if (!maestro) throw new Error('MAESTRO_NOT_FOUND');
      if (tipo === 'SALIDA' && qty > maestro.saldo) throw new Error('SALDO_INSUFICIENTE');
      const movimiento = await tx.movimiento.create({
        data: { tipo, cantidad: qty, maestroId, userId },
        include: { ejecutadoPor: { select: { name: true, lastName: true } } },
      });
      const nuevoSaldo = tipo === 'ENTRADA' ? maestro.saldo + qty : maestro.saldo - qty;
      await tx.maestro.update({ where: { id: maestroId }, data: { saldo: nuevoSaldo } });
      return { movimiento, nuevoSaldo };
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    if ((error as { message?: string })?.message === 'MAESTRO_NOT_FOUND') return NextResponse.json({ error: 'Maestro no encontrado' }, { status: 404 });
    if ((error as { message?: string })?.message === 'SALDO_INSUFICIENTE') return NextResponse.json({ error: 'Saldo insuficiente para esta salida' }, { status: 400 });
    console.error('Error creando movimiento:', error);
    return NextResponse.json({ error: 'Error al crear movimiento' }, { status: 500 });
  }
}
