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
import { IconPackage } from '@tabler/icons-react';

type Props = {
  checkout: {
    id: string;
    dueDate: Date | string;
    item: { book: { title: string } };
    user: { name: string; lastName: string | null };
  };
};

function formatFecha(dateInput: Date | string) {
  return new Date(dateInput).toLocaleDateString('es-CO');
}

export function BotonRecibirPrestamo({ checkout }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function recibir() {
    setLoading(true);
    try {
      const response = await fetch(`/api/checkouts/${checkout.id}/return`, {
        method: 'POST',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'No se pudo registrar la devolución');
      }

      toast.success('Devolución registrada correctamente');
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error recibiendo préstamo:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al registrar la devolución'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-1.5 text-xs">
            <IconPackage className="size-3.5" />
            Recibir
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recibir devolución</DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            Se registrará la entrega física de{' '}
            <strong>{checkout.item.book.title}</strong> por parte de{' '}
            <strong>
              {checkout.user.name} {checkout.user.lastName ?? ''}
            </strong>
            . Vencía el <strong>{formatFecha(checkout.dueDate)}</strong>.
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
          <Button type="button" disabled={loading} onClick={recibir}>
            {loading && <Spinner className="size-4 mr-2" />}
            {loading ? 'Procesando...' : 'Confirmar devolución'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
