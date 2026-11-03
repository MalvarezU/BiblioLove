import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/books/[id] - Detalle de un libro.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        author: true,
        category: true,
        genre: true,
        items: { where: { deleted: false } },
      },
    });

    if (!book) {
      return NextResponse.json({ error: 'Libro no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ book }, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo libro:', error);
    return NextResponse.json({ error: 'Error al obtener libro' }, { status: 500 });
  }
}

// PATCH /api/books/[id] - Actualiza los datos bibliograficos del libro.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    const book = await prisma.book.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: String(body.title).trim() }),
        ...(body.authorId !== undefined && { authorId: Number(body.authorId) }),
      },
    });

    return NextResponse.json({ book }, { status: 200 });
  } catch (error) {
    console.error('Error actualizando libro:', error);
    return NextResponse.json({ error: 'Error al actualizar libro' }, { status: 500 });
  }
}
