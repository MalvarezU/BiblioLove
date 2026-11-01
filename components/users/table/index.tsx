import { MoreHorizontalIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IconShieldCheck, IconUser, IconUsers } from '@tabler/icons-react';
import Link from 'next/link';

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

export function TableActions({ users }: { users: UserItem[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800/80 bg-slate-950/40 hover:bg-transparent">
            <TableHead className="text-slate-400 text-xs uppercase tracking-wider font-semibold pl-6">
              Usuario
            </TableHead>
            <TableHead className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
              Correo Electronico
            </TableHead>
            <TableHead className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
              Estado
            </TableHead>
            <TableHead className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
              Rol
            </TableHead>
            <TableHead className="text-right text-slate-400 text-xs uppercase tracking-wider font-semibold pr-6">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length ? (
            users.map((user) => {
              const iniciales = user.name.slice(0, 2).toUpperCase();
              return (
                <TableRow
                  key={user.id}
                  className="border-slate-800/60 hover:bg-slate-800/40 transition-colors"
                >
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 font-bold text-xs text-slate-200">
                        {iniciales}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-200 text-sm">
                          {user.name} {user.lastName ?? ''}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {user.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-slate-300 font-mono text-xs">
                    {user.email}
                  </TableCell>

                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.enabled
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          user.enabled ? 'bg-emerald-400' : 'bg-red-400'
                        }`}
                      />
                      {user.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {user.role === 'ADMIN' ? (
                        <IconShieldCheck className="size-3 text-blue-400" />
                      ) : (
                        <IconUser className="size-3 text-slate-400" />
                      )}
                      {user.role}
                    </span>
                  </TableCell>

                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg"
                          >
                            <MoreHorizontalIcon className="size-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent
                        align="end"
                        className="bg-slate-900/95 border-slate-800 text-slate-200 shadow-xl backdrop-blur-md rounded-lg"
                      >
                        <Link href={`/users/${user.id}`}>
                          <DropdownMenuItem className="text-slate-200 hover:bg-slate-800 cursor-pointer text-xs">
                            Ver detalles
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator className="bg-slate-800" />
                        <DropdownMenuItem
                          variant="destructive"
                          className="text-red-400 hover:bg-red-950/40 cursor-pointer text-xs"
                        >
                          Desactivar usuario
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                <div className="flex flex-col items-center justify-center gap-2">
                  <IconUsers className="size-8 text-slate-600 stroke-1" />
                  <p className="text-sm font-medium text-slate-400">
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
