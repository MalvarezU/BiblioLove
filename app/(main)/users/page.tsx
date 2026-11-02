import React from 'react';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { TableActions } from '@/components/users/table';
import { DialogCrearUsuario } from '@/components/users/dialog';
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

// Pagina de administracion de usuarios (solo ADMIN)
export default async function UsersPage() {
  const session = await getAdminSession();

  if (!session || session.role !== 'ADMIN') {
    redirect('/home');
  }

  const data = await getUsers();

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconUsers className="size-5" />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Administracion de Usuarios
            </h1>
            <p className="text-xs text-muted-foreground">
              Control de roles, cuentas de acceso y estados
            </p>
          </div>
        </div>

        <DialogCrearUsuario />
      </div>

      {/* Contenedor de la tabla */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <TableActions users={data} />
      </div>
    </div>
  );
}
