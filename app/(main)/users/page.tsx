import React from 'react';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { TableActions } from '@/components/users/table';
import { DialogDemo } from '@/components/users/dialog';
import { IconUsers } from '@tabler/icons-react';

async function getUsers() {
  const users = await prisma.user.findMany({
    where: { deleted: false },
    select: {
      id: true,
      name: true,
      lastName: true,
      email: true,
      enabled: true,
      deleted: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return users;
}

async function getAdminSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_user_id')?.value;

  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId, deleted: false },
    select: { id: true, role: true },
  });
}

export default async function UsersPage() {
  const session = await getAdminSession();

  if (!session || session.role !== 'ADMIN') {
    redirect('/home');
  }

  const data = await getUsers();

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-600/15 text-indigo-400 border border-indigo-500/20">
            <IconUsers className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Administracion de Usuarios
            </h1>
            <p className="text-xs text-slate-400">
              Control de roles, cuentas de acceso y estados de usuarios
            </p>
          </div>
        </div>

        <div>
          <DialogDemo />
        </div>
      </div>

      {/* Contenedor de la tabla */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 shadow-xl backdrop-blur-sm overflow-hidden">
        <TableActions users={data} />
      </div>
    </div>
  );
}
