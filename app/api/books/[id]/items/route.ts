import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/books/[id]/items - Agrega varios ejemplares de una misma editorial.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { publisher, quantity, userId } = await request.json();

    if (!publisher || !userId) {
      return NextResponse.json(
        { error: 'publisher y userId son requeridos' },
        { status: 400 }
      );
    }

    const cantidad = Number(quantity);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      return NextResponse.json(
        { error: 'La cantidad de ejemplares debe ser mayor a 0' },
        { status: 400 }
      );
    }

    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      return NextResponse.json({ error: 'Libro no encontrado' }, { status: 404 });
    }

    const result = await prisma.item.createMany({
      data: Array.from({ length: cantidad }, () => ({
        bookId: id,
        status: 'Disponible',
        createdById: userId,
        publisher: String(publisher).trim(),
      })),
    });

    return NextResponse.json({ count: result.count }, { status: 201 });
  } catch (error) {
    console.error('Error agregando ejemplares:', error);
    return NextResponse.json({ error: 'Error al agregar ejemplares' }, { status: 500 });
  }
}
