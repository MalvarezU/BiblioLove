'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  IconShieldCheck,
  IconUser,
  IconUsers,
  IconUserCheck,
  IconUserOff,
  IconCalendar,
  IconPencil,
} from '@tabler/icons-react';
import { EditRoleDialog } from '@/components/users/edit-role-dialog';

type UserItem = {
  id: string;
  name: string;
  lastName: string | null;
  email: string;
  enabled: boolean;
  deleted: boolean;
  role: string;
  createdAt: Date | string;
};

type Props = {
  users: UserItem[];
  currentUserId?: string;
};

// Formatea la fecha de creacion de manera uniforme y determinista
function formatFechaCreacion(dateInput: Date | string): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

// Tabla de usuarios con acciones para rol, estado activo/inactivo y enlace a edicion
export function TableActions({ users, currentUserId }: Props) {
  const router = useRouter();
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  async function handleToggleEnabled(user: UserItem) {
    if (user.id === currentUserId) {
      toast.error('No puedes desactivar tu propia cuenta de administrador.');
      return;
    }

    const nuevoEstado = !user.enabled;
    setLoadingId(user.id);

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nuevoEstado }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'Error al actualizar el estado del usuario');
      }

      toast.success(
        nuevoEstado
          ? `Usuario ${user.name} activado exitosamente`
          : `Usuario ${user.name} desactivado exitosamente`
      );
      router.refresh();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al cambiar estado del usuario'
      );
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-6">Usuario</TableHead>
            <TableHead>Correo Electrónico</TableHead>
            <TableHead>Fecha de Creación</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className="pr-6 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => {
              const iniciales = user.name.slice(0, 2).toUpperCase();
              const isSelf = user.id === currentUserId;
              const isLoading = loadingId === user.id;

              return (
                <TableRow key={user.id}>
                  {/* Informacion de usuario */}
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                        {iniciales}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {user.name} {user.lastName ?? ''}
                          {isSelf && (
                            <span className="ml-2 text-[10px] font-semibold text-primary uppercase">
                              (Tú)
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          #{user.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Correo */}
                  <TableCell className="text-sm font-normal text-foreground">
                    {user.email}
                  </TableCell>

                  {/* Fecha de Creacion */}
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <IconCalendar className="size-3.5" />
                      {formatFechaCreacion(user.createdAt)}
                    </span>
                  </TableCell>

                  {/* Estado */}
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.enabled
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          user.enabled ? 'bg-success' : 'bg-destructive'
                        }`}
                      />
                      {user.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>

                  {/* Rol */}
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-primary/15 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {user.role === 'ADMIN' ? (
                        <IconShieldCheck className="size-3" />
                      ) : (
                        <IconUser className="size-3" />
                      )}
                      {user.role}
                    </span>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Boton Activar / Desactivar */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isLoading || isSelf}
                        onClick={() => handleToggleEnabled(user)}
                        className={`h-8 text-xs gap-1.5 ${
                          user.enabled
                            ? 'border-destructive/30 text-destructive hover:bg-destructive/10'
                            : 'border-success/30 text-success hover:bg-success/10'
                        }`}
                        title={
                          isSelf
                            ? 'No puedes desactivar tu propia cuenta'
                            : user.enabled
                            ? 'Desactivar usuario'
                            : 'Activar usuario'
                        }
                      >
                        {isLoading ? (
                          <Spinner className="size-3.5" />
                        ) : user.enabled ? (
                          <IconUserOff className="size-3.5" />
                        ) : (
                          <IconUserCheck className="size-3.5" />
                        )}
                        <span>{user.enabled ? 'Desactivar' : 'Activar'}</span>
                      </Button>

                      {/* Dialogo para editar rol */}
                      <EditRoleDialog
                        user={{ id: user.id, email: user.email, role: user.role }}
                      />

                      {/* Enlace para edicion completa del usuario */}
                      <Button
                        nativeButton={false}
                        variant="ghost"
                        size="sm"
                        render={<Link href={`/users/${user.id}`} />}
                        className="h-8 px-2 text-muted-foreground hover:text-foreground"
                        title="Editar datos del usuario"
                      >
                        <IconPencil className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <IconUsers className="size-8 stroke-1" />
                  <p className="text-sm font-medium">No hay usuarios registrados</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
