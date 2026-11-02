'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconShieldCheck, IconMail, IconEdit } from '@tabler/icons-react';

type Props = {
  user: { id: string; email: string; role: 'ADMIN' | 'USER' };
};

export function EditRoleDialog({ user }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [role, setRole] = React.useState<'ADMIN' | 'USER'>(user.role);

  // Mantiene sincronizado el rol actual cada vez que se abre el dialogo
  React.useEffect(() => {
    if (open) {
      setRole(user.role);
    }
  }, [open, user.role]);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'Error al actualizar rol');
      }

      toast.success('Rol actualizado exitosamente');
      setOpen(false);
      router.refresh();
    } catch (e: unknown) {
      toast.error(
        e instanceof Error ? e.message : 'Error al actualizar el rol del usuario'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-border text-foreground hover:bg-muted text-xs gap-1.5"
          >
            <IconEdit className="size-3.5" />
            <span>Editar rol</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm bg-card border border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground font-heading">
            <IconShieldCheck className="size-5 text-primary" />
            Editar Rol de Usuario
          </DialogTitle>
          <DialogDescription className="text-muted-foreground flex items-center gap-1.5 pt-1">
            <IconMail className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="font-medium text-foreground truncate">{user.email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Rol del Sistema
          </label>
          <Select value={role} onValueChange={(v) => setRole(v as 'ADMIN' | 'USER')}>
            <SelectTrigger className="w-full bg-muted/50 border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="ADMIN">
                <span className="font-medium">ADMIN</span> — Administrador total
              </SelectItem>
              <SelectItem value="USER">
                <span className="font-medium">USER</span> — Usuario lector
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => setOpen(false)}
            className="border-border text-foreground hover:bg-muted"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
          >
            {loading && <Spinner className="size-4" />}
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
