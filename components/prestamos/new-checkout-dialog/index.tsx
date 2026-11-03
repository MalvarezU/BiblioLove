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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
  IconAlertTriangle,
  IconCalendarEvent,
  IconPlus,
} from '@tabler/icons-react';

type LibroDisponible = {
  id: string;
  title: string;
  items: { id: string; publisher: string }[];
};

type UsuarioActivo = {
  id: string;
  name: string;
  lastName: string | null;
  email: string;
};

type Props = {
  libros: LibroDisponible[];
  usuarios: UsuarioActivo[];
  usuariosRetrasados: string[];
};

function fechaLocal(d: Date) {
  return d.toLocaleDateString('es-CO');
}

export function DialogNuevoPrestamo({
  libros,
  usuarios,
  usuariosRetrasados,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [warningOpen, setWarningOpen] = React.useState(false);
  const [bookId, setBookId] = React.useState('');
  const [itemId, setItemId] = React.useState('');
  const [userId, setUserId] = React.useState('');

  const libro = libros.find((l) => l.id === bookId);
  const usuarioRetrasado = Boolean(userId && usuariosRetrasados.includes(userId));

  const [fechas] = React.useState(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const entrega = new Date(hoy);
    entrega.setDate(entrega.getDate() + 30);
    return { hoy, entrega };
  });

  function reset() {
    setBookId('');
    setItemId('');
    setUserId('');
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) reset();
  }

  function handleUserChange(value: string | null) {
    const next = value ?? '';
    setUserId(next);
    if (next && usuariosRetrasados.includes(next)) {
      setWarningOpen(true);
    }
  }

  async function registrarPrestamo() {
    if (!bookId || !itemId || !userId) {
      toast.error('Selecciona el libro, el ejemplar y el usuario.');
      return;
    }

    if (usuariosRetrasados.includes(userId)) {
      setWarningOpen(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/checkouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, userId }),
      });

      const payload = await response.json().catch(() => null);

      if (response.status === 409 && payload?.code === 'USER_OVERDUE') {
        setWarningOpen(true);
        return;
      }

      if (!response.ok) {
        throw new Error(payload?.error || 'No se pudo registrar el préstamo');
      }

      toast.success('Préstamo registrado correctamente');
      setOpen(false);
      reset();
      router.refresh();
    } catch (error) {
      console.error('Error registrando préstamo:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al registrar el préstamo'
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
            <Button type="button">
              <IconPlus className="size-4" />
              Nuevo Préstamo
            </Button>
          }
        />
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Préstamo</DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Selecciona un libro con ejemplares disponibles, el ejemplar y el
              usuario que recibirá el préstamo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <IconCalendarEvent className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>
              <span className="font-medium text-foreground">Fecha de préstamo:</span>{' '}
              {fechaLocal(fechas.hoy)}
              <br />
              <span className="font-medium text-foreground">Fecha de entrega:</span>{' '}
              {fechaLocal(fechas.entrega)} (30 días)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Libro</Label>
            <Select
              items={libros.map((l) => ({ value: l.id, label: l.title }))}
              value={bookId}
              onValueChange={(value) => {
                setBookId(value ?? '');
                setItemId('');
              }}
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Selecciona un libro disponible" />
              </SelectTrigger>
              <SelectContent>
                {libros.map((l) => (
                  <SelectItem key={l.id} value={l.id} className="text-xs">
                    {l.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {libro ? (
            <div className="space-y-2">
              <Label>Ejemplar</Label>
              <RadioGroup
                value={itemId}
                onValueChange={(value) => setItemId(value ?? '')}
                className="gap-0 overflow-hidden rounded-lg border border-border"
              >
                <div className="grid grid-cols-[3rem_1fr_4rem] items-center gap-2 bg-muted/60 px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <span>#</span>
                  <span>Editorial</span>
                  <span className="text-right">Elegir</span>
                </div>
                {libro.items.map((item, index) => (
                  <div
                    key={item.id}
                    role="presentation"
                    onClick={() => setItemId(item.id)}
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
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
              Selecciona un libro para ver sus ejemplares disponibles.
            </p>
          )}

          <div className="space-y-2">
            <Label>Usuario</Label>
            <Select
              items={usuarios.map((u) => ({
                value: u.id,
                label: `${u.name} ${u.lastName ?? ''}`.trim(),
              }))}
              value={userId}
              onValueChange={handleUserChange}
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Selecciona un usuario activo" />
              </SelectTrigger>
              <SelectContent>
                {usuarios.map((u) => (
                  <SelectItem key={u.id} value={u.id} className="text-xs">
                    {u.name} {u.lastName ?? ''} · {u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {usuarioRetrasado && (
              <p className="flex items-center gap-1.5 text-[11px] text-destructive">
                <IconAlertTriangle className="size-3.5" />
                Este usuario tiene préstamos en retraso.
              </p>
            )}
          </div>

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
              disabled={loading || !bookId || !itemId || !userId}
              onClick={registrarPrestamo}
            >
              {loading && <Spinner className="size-4 mr-2" />}
              {loading ? 'Registrando...' : 'Registrar Préstamo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={warningOpen} onOpenChange={setWarningOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconAlertTriangle className="size-5 text-destructive" />
              Préstamo no permitido
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              El usuario seleccionado tiene préstamos en retraso. No es posible
              registrar un nuevo préstamo hasta que regularice sus devoluciones.
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
