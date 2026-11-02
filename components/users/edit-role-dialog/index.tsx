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

type Props = {
  user: { id: string; email: string; role: 'ADMIN' | 'USER' };
};

export function EditRoleDialog({ user }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [role, setRole] = React.useState<'ADMIN' | 'USER'>(user.role);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error('Error al actualizar rol');
      toast.success('Rol actualizado exitosamente');
      setOpen(false);
      router.refresh();
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message || 'Error al actualizar rol');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted text-xs">
            Editar rol
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm bg-card border border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">Editar usuario</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {user.email}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rol</label>
          <Select value={role} onValueChange={(v) => setRole(v as 'ADMIN' | 'USER')}>
            <SelectTrigger className="bg-muted border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="ADMIN">ADMIN</SelectItem>
              <SelectItem value="USER">USER</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          {!loading ? (
            <>
              <Button variant="outline" onClick={() => setOpen(false)} className="border-border text-foreground hover:bg-muted">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white">
                Guardar
              </Button>
            </>
          ) : (
            <Spinner className="size-6 text-primary" />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
