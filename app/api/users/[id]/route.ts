import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/[id] - Obtiene los datos de un usuario por su ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        role: true,
        enabled: true,
        deleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || user.deleted) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json({ error: 'Error al obtener usuario' }, { status: 500 });
  }
}

// PATCH /api/users/[id] - Actualiza rol, estado o informacion basica de un usuario
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.lastName !== undefined) {
      data.lastName = body.lastName ? String(body.lastName).trim() : null;
    }
    if (body.email !== undefined) {
      data.email = String(body.email).trim().toLowerCase();
    }
    if (body.role !== undefined) data.role = body.role;
    if (body.enabled !== undefined) data.enabled = Boolean(body.enabled);
    if (body.password !== undefined && String(body.password).trim() !== '') {
      data.password = String(body.password).trim();
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        role: true,
        enabled: true,
      },
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}
