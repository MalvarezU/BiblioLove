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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Spinner } from '@/components/ui/spinner';
import { IconAlertTriangle, IconBookmarkPlus, IconCalendarEvent } from '@tabler/icons-react';

type Ejemplar = {
  id: string;
  status: string;
  enabled: boolean;
  deleted: boolean;
  publisher: string;
};

type Props = {
  libro: { id: string; title: string; items: Ejemplar[] };
  userId: string;
  disabled?: boolean;
};

function fechaLocal(d: Date) {
  return d.toLocaleDateString('es-CO');
}

export function DialogReservarEjemplar({ libro, userId, disabled }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [warningOpen, setWarningOpen] = React.useState(false);

  const disponibles = libro.items.filter(
    (item) => !item.deleted && item.enabled && item.status === 'Disponible'
  );

  const [fechas] = React.useState(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const min = new Date(hoy);
    min.setDate(min.getDate() + 1);
    const max = new Date(min);
    max.setDate(max.getDate() + 5);
    return { min, max };
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setSelected('');
      setWarningOpen(false);
    }
  }

  async function reservar() {
    if (!selected) {
      toast.error('Selecciona un ejemplar.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: selected, userId }),
      });

      const payload = await response.json().catch(() => null);

      if (response.status === 409 && payload?.code === 'USER_OVERDUE') {
        setWarningOpen(true);
        return;
      }

      if (!response.ok) {
        throw new Error(payload?.error || 'No se pudo crear la reserva');
      }

      toast.success('Reserva creada correctamente');
      setOpen(false);
      setSelected('');
      router.refresh();
    } catch (error) {
      console.error('Error creando reserva:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al crear la reserva'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            title={
              disabled
                ? 'No hay ejemplares disponibles'
                : 'Reservar un ejemplar de este libro'
            }
            className="gap-1.5 text-xs"
          >
            <IconBookmarkPlus className="size-3.5" />
            Reservar
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reservar Ejemplar</DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            Libro: <strong>{libro.title}</strong>. Selecciona una de las
            ediciones disponibles.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <IconCalendarEvent className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            <span className="font-medium text-foreground">Fecha de reclamo:</span>{' '}
            {fechaLocal(fechas.min)}
            <br />
            <span className="font-medium text-foreground">Fecha final de reclamo:</span>{' '}
            {fechaLocal(fechas.max)}
          </p>
        </div>

        {disponibles.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No hay ejemplares disponibles para reservar.
          </div>
        ) : (
          <RadioGroup
            value={selected}
            onValueChange={(value) => setSelected(value ?? '')}
            className="gap-0 overflow-hidden rounded-lg border border-border"
          >
            <div className="grid grid-cols-[3rem_1fr_4rem] items-center gap-2 bg-muted/60 px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <span>#</span>
              <span>Editorial</span>
              <span className="text-right">Elegir</span>
            </div>
            {disponibles.map((item, index) => (
              <div
                key={item.id}
                role="presentation"
                onClick={() => setSelected(item.id)}
                className="grid cursor-pointer grid-cols-[3rem_1fr_4rem] items-center gap-2 border-t border-border px-3 py-2.5 text-xs transition-colors hover:bg-muted/50"
              >
                <span className="font-mono text-muted-foreground">{index + 1}</span>
                <span className="font-medium">{item.publisher}</span>
                <span className="flex justify-end">
                  <RadioGroupItem value={item.id} aria-label={`Ejemplar ${index + 1}`} />
                </span>
              </div>
            ))}
          </RadioGroup>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!selected || loading || disponibles.length === 0}
            onClick={reservar}
          >
            {loading && <Spinner className="size-4 mr-2" />}
            {loading ? 'Reservando...' : 'Aceptar'}
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>

      <Dialog open={warningOpen} onOpenChange={setWarningOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconAlertTriangle className="size-5 text-destructive" />
              Reserva no permitida
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Tienes préstamos en retraso. No es posible realizar nuevas reservas
              hasta que regularices tus devoluciones.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setWarningOpen(false)}>
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
