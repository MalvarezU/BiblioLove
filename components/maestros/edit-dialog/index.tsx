'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';
import { IconAlertTriangle, IconPencil, IconTrash } from '@tabler/icons-react';

type Ejemplar = {
  id: string;
  publisher: string;
  status: string;
  enabled: boolean;
  deleted: boolean;
};

type Props = {
  libro: { id: string; title: string; items: Ejemplar[] };
};

function estadoEjemplar(item: Ejemplar) {
  if (item.deleted) {
    return { texto: 'Perdido', clase: 'bg-destructive/10 text-destructive' };
  }
  if (!item.enabled) {
    return { texto: 'Deteriorado', clase: 'bg-warning/10 text-warning' };
  }
  if (item.status === 'Disponible') {
    return { texto: item.status, clase: 'bg-success/10 text-success' };
  }
  if (item.status === 'Reservado') {
    return { texto: item.status, clase: 'bg-warning/10 text-warning' };
  }
  if (item.status === 'En préstamo') {
    return { texto: item.status, clase: 'bg-primary/10 text-primary' };
  }
  return { texto: item.status, clase: 'bg-muted text-muted-foreground' };
}

export function DialogEditarLibro({ libro }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  async function actualizar(itemId: string, data: { enabled: boolean; deleted: boolean }) {
    setLoadingId(itemId);
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'No se pudo actualizar el ejemplar');
      }

      toast.success(
        data.deleted
          ? 'Ejemplar marcado como perdido'
          : 'Ejemplar marcado como deteriorado'
      );
      router.refresh();
    } catch (error) {
      console.error('Error actualizando ejemplar:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al actualizar el ejemplar'
      );
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            title="Gestionar ejemplares"
            aria-label="Gestionar ejemplares"
          >
            <IconPencil className="size-4" />
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gestionar Ejemplares</DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            Libro: <strong>{libro.title}</strong>. Marca un ejemplar como
            deteriorado para dejar de prestarlo, o como perdido para retirarlo
            del catálogo.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto rounded-lg border border-border">
          <Table className="min-w-[520px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-14 pl-4">#</TableHead>
                <TableHead>Editorial</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="pr-4 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {libro.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-20 text-center text-xs text-muted-foreground">
                    Este libro no tiene ejemplares registrados
                  </TableCell>
                </TableRow>
              ) : (
                libro.items.map((item, index) => {
                  const estado = estadoEjemplar(item);
                  const cargando = loadingId === item.id;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="pl-4 font-mono text-xs text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {item.publisher}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${estado.clase}`}
                        >
                          {estado.texto}
                        </span>
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            title="Marcar como deteriorado"
                            aria-label="Marcar como deteriorado"
                            disabled={cargando || (!item.enabled && !item.deleted)}
                            onClick={() =>
                              actualizar(item.id, { enabled: false, deleted: false })
                            }
                          >
                            {cargando ? (
                              <Spinner className="size-3.5" />
                            ) : (
                              <IconAlertTriangle className="size-3.5" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            title="Marcar como perdido"
                            aria-label="Marcar como perdido"
                            disabled={cargando || item.deleted}
                            onClick={() =>
                              actualizar(item.id, { enabled: false, deleted: true })
                            }
                          >
                            {cargando ? (
                              <Spinner className="size-3.5" />
                            ) : (
                              <IconTrash className="size-3.5" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
