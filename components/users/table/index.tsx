import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IconShieldCheck, IconUser, IconUsers } from '@tabler/icons-react';
import { EditRoleDialog } from '@/components/users/edit-role-dialog';

type UserItem = {
  id: string;
  name: string;
  lastName: string | null;
  email: string;
  enabled: boolean;
  deleted: boolean;
  role: 'ADMIN' | 'USER';
  createdAt: Date;
};

// Tabla de usuarios con acciones en menu desplegable
export function TableActions({ users }: { users: UserItem[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-6">Usuario</TableHead>
            <TableHead>Correo Electronico</TableHead>
            <TableHead>Fecha de creacion</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className="pr-6 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length ? (
            users.map((user) => {
              const iniciales = user.name.slice(0, 2).toUpperCase();
              return (
                <TableRow key={user.id}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                        {iniciales}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {user.name} {user.lastName ?? ''}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {user.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm">{user.email}</TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('es-CO')}
                  </TableCell>

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

                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <EditRoleDialog key={user.id} user={{ id: user.id, email: user.email, role: user.role }} />
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
                  <p className="text-sm font-medium">
                    No hay usuarios registrados
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
