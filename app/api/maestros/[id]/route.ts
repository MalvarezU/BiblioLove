import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/maestros/[id] - Retorna un maestro especifico por id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const maestro = await prisma.maestro.findUnique({
      where: { id, deleted: false },
      include: {
        creadoPor: { select: { name: true, lastName: true } },
        movimientos: {
          orderBy: { createdAt: 'desc' },
          include: {
            ejecutadoPor: { select: { name: true, lastName: true } },
          },
        },
      },
    });

    if (!maestro) {
      return NextResponse.json({ error: 'Maestro no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ maestro }, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo maestro:', error);
    return NextResponse.json({ error: 'Error al obtener maestro' }, { status: 500 });
  }
}

// PATCH /api/maestros/[id] - Actualiza nombre o saldo de un maestro
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    const maestro = await prisma.maestro.update({
      where: { id },
      data: {
        ...(body.nombre !== undefined && { nombre: body.nombre }),
        ...(body.saldo !== undefined && { saldo: Number(body.saldo) }),
      },
    });

    return NextResponse.json({ maestro }, { status: 200 });
  } catch (error) {
    console.error('Error actualizando maestro:', error);
    return NextResponse.json({ error: 'Error al actualizar maestro' }, { status: 500 });
  }
}

// DELETE /api/maestros/[id] - Borrado logico del maestro (soft delete)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    await prisma.maestro.update({
      where: { id },
      data: { deleted: true },
    });

    return NextResponse.json({ message: 'Maestro eliminado' }, { status: 200 });
  } catch (error) {
    console.error('Error eliminando maestro:', error);
    return NextResponse.json({ error: 'Error al eliminar maestro' }, { status: 500 });
  }
}

