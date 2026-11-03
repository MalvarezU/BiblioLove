'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  IconSearch,
  IconBook2,
  IconCheck,
  IconAlertTriangle,
  IconX,
  IconArchive,
} from '@tabler/icons-react';
import { DialogEditarLibro } from '@/components/maestros/edit-dialog';
import { DialogAgregarEjemplar } from '@/components/maestros/add-copy-dialog';
import { DialogReservarEjemplar } from '@/components/maestros/reserve-dialog';

type Libro = {
  id: string;
  title: string;
  author: { id: number; name: string; lastName: string };
  category: { name: string };
  genre: { name: string };
  items: {
    id: string;
    status: string;
    enabled: boolean;
    deleted: boolean;
    publisher: string;
  }[];
};

type Props = {
  libros: Libro[];
  esAdmin: boolean;
  userId?: string;
};

function claseStock(disponibles: number, total: number) {
  if (disponibles > 0) return 'bg-success/10 text-success';
  if (total > 0) return 'bg-warning/10 text-warning';
  return 'bg-destructive/10 text-destructive';
}

// Tabla de libros con buscador por título, autor, categoría o género.
export function TablaLibros({ libros, esAdmin, userId }: Props) {
  const [busqueda, setBusqueda] = useState('');

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return libros;
    const term = busqueda.toLowerCase();
    return libros.filter(
      (l) =>
        l.title.toLowerCase().includes(term) ||
        `${l.author.name} ${l.author.lastName}`.toLowerCase().includes(term) ||
        l.category.name.toLowerCase().includes(term) ||
        l.genre.name.toLowerCase().includes(term)
    );
  }, [libros, busqueda]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por título, autor, categoría o género..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <IconX className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Mostrando:</span>
          <span className="font-medium text-foreground">
            {filtrados.length} de {libros.length} {libros.length === 1 ? 'libro' : 'libros'}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Título</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Género</TableHead>
              <TableHead className="w-44">Disponibilidad</TableHead>
              <TableHead className="w-28 pr-6 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length > 0 ? (
              filtrados.map((libro) => {
                const total = libro.items.length;
                const disponibles = libro.items.filter(
                  (i) => !i.deleted && i.enabled && i.status === 'Disponible'
                ).length;

                return (
                  <TableRow key={libro.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <IconBook2 className="size-4" />
                        </span>
                        <span className="text-xs font-medium">{libro.title}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs">
                      {libro.author.name} {libro.author.lastName}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {libro.category.name}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {libro.genre.name}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${claseStock(
                          disponibles,
                          total
                        )}`}
                      >
                        {disponibles > 0 && <IconCheck className="size-3" />}
                        {disponibles === 0 && total > 0 && (
                          <IconAlertTriangle className="size-3" />
                        )}
                        {total === 0 && <IconArchive className="size-3" />}
                        {total === 0
                          ? 'Sin ejemplares'
                          : `${disponibles} de ${total} disponibles`}
                      </span>
                    </TableCell>

                    <TableCell className="pr-6">
                      <div className="flex items-center justify-end gap-1">
                        {esAdmin && userId ? (
                          <>
                            <DialogEditarLibro libro={libro} />
                            <DialogAgregarEjemplar libro={libro} userId={userId} />
                          </>
                        ) : userId ? (
                          <DialogReservarEjemplar
                            libro={libro}
                            userId={userId}
                            disabled={disponibles === 0}
                          />
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <IconBook2 className="size-8 stroke-1" />
                    <p className="text-sm font-medium">No se encontraron libros</p>
                    <p className="text-xs">
                      {busqueda
                        ? 'Intenta con otro término de búsqueda'
                        : 'El catálogo se encuentra vacío'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
