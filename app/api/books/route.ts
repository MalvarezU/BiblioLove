import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// GET /api/books - Catalogo de libros con autor, categoria, genero y ejemplares.
export async function GET(): Promise<NextResponse> {
  try {
    const books = await prisma.book.findMany({
      select: {
        id: true,
        title: true,
        author: { select: { id: true, name: true, lastName: true } },
        category: { select: { id: true, name: true } },
        genre: { select: { id: true, name: true } },
        items: {
          where: { deleted: false },
          select: { id: true, status: true, enabled: true, publisher: true },
        },
      },
      orderBy: { title: 'asc' },
    });

    return NextResponse.json({ books }, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo libros:', error);
    return NextResponse.json({ error: 'Error al obtener libros' }, { status: 500 });
  }
}

// POST /api/books - Crea un libro con su primer ejemplar.
// Si ya existe un titulo equivalente (sin distinguir tildes, mayusculas o
// espacios extra), responde 409 para que el cliente pregunte si desea agregar
// un nuevo ejemplar al libro existente.
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { title, categoryId, genreId, authorId, newAuthor, publisher, userId } =
      await request.json();

    if (!title || !categoryId || !genreId || !publisher || !userId) {
      return NextResponse.json(
        { error: 'title, categoryId, genreId, publisher y userId son requeridos' },
        { status: 400 }
      );
    }

    if (!authorId && !(newAuthor?.name && newAuthor?.lastName)) {
      return NextResponse.json(
        { error: 'Selecciona un autor o registra uno nuevo' },
        { status: 400 }
      );
    }

    const titulo = String(title).trim();
    const existentes = await prisma.book.findMany({ select: { id: true, title: true } });
    const duplicado = existentes.find(
      (book) => normalizar(book.title) === normalizar(titulo)
    );

    if (duplicado) {
      return NextResponse.json(
        {
          error: 'El libro ya existe',
          code: 'BOOK_EXISTS',
          book: duplicado,
        },
        { status: 409 }
      );
    }

    let autorId = authorId ? Number(authorId) : 0;
    if (!autorId) {
      const autor = await prisma.author.create({
        data: {
          name: String(newAuthor.name).trim(),
          lastName: String(newAuthor.lastName).trim(),
          biography: newAuthor.biography ? String(newAuthor.biography).trim() : null,
        },
      });
      autorId = autor.id;
    }

    const book = await prisma.book.create({
      data: {
        title: titulo,
        categoryId: Number(categoryId),
        genreId: Number(genreId),
        authorId: autorId,
        items: {
          create: [
            {
              status: 'Disponible',
              createdById: userId,
              publisher: String(publisher).trim(),
            },
          ],
        },
      },
      include: {
        author: true,
        category: true,
        genre: true,
        items: true,
      },
    });

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error('Error creando libro:', error);
    return NextResponse.json({ error: 'Error al crear libro' }, { status: 500 });
  }
}
