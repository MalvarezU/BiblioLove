import { prisma } from '@/lib/prisma';
import { TablaMaestros } from '@/components/maestros/tabla';
import { DialogCrearMaestro } from '@/components/maestros/dialog';
import { cookies } from 'next/headers';
import { IconBook2 } from '@tabler/icons-react';

async function getMaestros() {
  const maestros = await prisma.maestro.findMany({
    where: { deleted: false },
    select: {
      id: true,
      nombre: true,
      saldo: true,
      createdAt: true,
      creadoPor: {
        select: { name: true, lastName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return maestros;
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

// Pagina del catalogo de libros (inventario de maestros)
export default async function MaestrosPage() {
  const [maestros, usuario] = await Promise.all([getMaestros(), getUsuarioSesion()]);
  const esAdmin = usuario?.role === 'ADMIN';

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado de seccion */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconBook2 className="size-5" />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Catálogo de Libros y Materiales
            </h1>
            <p className="text-xs text-muted-foreground">
              Inventario de obras bibliográficas y control de existencias
            </p>
          </div>
        </div>

        {/* Solo administradores pueden crear nuevos registros de libros */}
        {esAdmin && usuario && (
          <DialogCrearMaestro userId={usuario.id} />
        )}
      </div>

      {/* Contenedor de la tabla visible para todos los usuarios */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <TablaMaestros maestros={maestros} />
      </div>
    </div>
  );
}
