import { prisma } from '@/lib/prisma';
import { TablaLibros } from '@/components/maestros/tabla';
import { DialogCrearLibro } from '@/components/maestros/dialog';
import { cookies } from 'next/headers';
import { IconBook2 } from '@tabler/icons-react';

async function getLibros() {
  return prisma.book.findMany({
    select: {
      id: true,
      title: true,
      author: { select: { id: true, name: true, lastName: true } },
      category: { select: { name: true } },
      genre: { select: { name: true } },
      items: {
        select: {
          id: true,
          status: true,
          enabled: true,
          deleted: true,
          publisher: true,
        },
      },
    },
    orderBy: { title: 'asc' },
  });
}

async function getCatalogos() {
  const [categorias, generos, autores] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.genre.findMany({ orderBy: { name: 'asc' } }),
    prisma.author.findMany({ orderBy: { name: 'asc' } }),
  ]);
  return { categorias, generos, autores };
}

async function getUsuarioSesion() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_user_id')?.value;

  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId, deleted: false },
    select: { id: true, name: true, role: true },
  });
}

// Pagina del catalogo de libros.
export default async function MaestrosPage() {
  const [libros, catalogos, usuario] = await Promise.all([
    getLibros(),
    getCatalogos(),
    getUsuarioSesion(),
  ]);
  const esAdmin = usuario?.role === 'ADMIN';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconBook2 className="size-5" />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Catálogo de Libros
            </h1>
            <p className="text-xs text-muted-foreground">
              Obras, autores, categorías, géneros y ejemplares disponibles
            </p>
          </div>
        </div>

        {esAdmin && usuario && (
          <DialogCrearLibro
            userId={usuario.id}
            categorias={catalogos.categorias}
            generos={catalogos.generos}
            autores={catalogos.autores}
          />
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <TablaLibros
          libros={libros}
          esAdmin={esAdmin}
          userId={usuario?.id}
        />
      </div>
    </div>
  );
}
