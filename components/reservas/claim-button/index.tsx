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
import { Spinner } from '@/components/ui/spinner';
import { IconAlertTriangle, IconCheck } from '@tabler/icons-react';

type Props = {
  reserva: {
    id: string;
    item: { book: { title: string } };
    user: { name: string; lastName: string | null };
  };
};

export function BotonReclamarReserva({ reserva }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [warningOpen, setWarningOpen] = React.useState(false);

  async function reclamar() {
    setLoading(true);
    try {
      const response = await fetch(`/api/reservations/${reserva.id}/claim`, {
        method: 'POST',
      });

      const payload = await response.json().catch(() => null);

      if (response.status === 409 && payload?.code === 'USER_OVERDUE') {
        setWarningOpen(true);
        return;
      }

      if (!response.ok) {
        throw new Error(payload?.error || 'No se pudo hacer efectiva la reserva');
      }

      toast.success('Reserva reclamada y préstamo registrado');
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error reclamando reserva:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al reclamar la reserva'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button size="sm" className="gap-1.5 text-xs">
              <IconCheck className="size-3.5" />
              Reclamar
            </Button>
          }
        />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hacer efectiva la reserva</DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Se registrará un préstamo por 30 días para{' '}
              <strong>
                {reserva.user.name} {reserva.user.lastName ?? ''}
              </strong>{' '}
              con el libro <strong>{reserva.item.book.title}</strong>. La reserva
              pasará al estado <strong>Reclamado</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="button" disabled={loading} onClick={reclamar}>
              {loading && <Spinner className="size-4 mr-2" />}
              {loading ? 'Procesando...' : 'Confirmar reclamo'}
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
              El usuario tiene préstamos en retraso. No es posible hacer efectiva
              la reserva hasta que regularice sus devoluciones.
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
