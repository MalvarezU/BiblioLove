import { prisma } from '@/lib/prisma';
import { TablaMaestros } from '@/components/maestros/tabla';
import { DialogCrearMaestro } from '@/components/maestros/dialog';
import { cookies } from 'next/headers';
import { IconBook2, IconInfoCircle } from '@tabler/icons-react';

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

// Pagina principal del modulo de Maestros (Inventario de libros)
export default async function MaestrosPage() {
  const [maestros, usuario] = await Promise.all([getMaestros(), getUsuarioSesion()]);
  const esAdmin = usuario?.role === 'ADMIN';

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado de seccion */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-600/15 text-blue-400 border border-blue-500/20">
              <IconBook2 className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100">
                Maestros de Biblioteca
              </h1>
              <p className="text-xs text-slate-400">
                Catalogo de titulos y control de existencias de libros
              </p>
            </div>
          </div>
        </div>

        {/* Accion exclusiva para Administradores */}
        <div className="flex items-center gap-3">
          {esAdmin && usuario ? (
            <DialogCrearMaestro userId={usuario.id} />
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg font-mono">
              <IconInfoCircle className="size-3.5" />
              Solo lectura (Rol: {usuario?.role ?? 'USER'})
            </span>
          )}
        </div>
      </div>

      {/* Contenedor estilizado de la tabla */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 shadow-xl backdrop-blur-sm overflow-hidden">
        <TablaMaestros maestros={maestros} />
      </div>
    </div>
  );
}
