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
          <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs">
            Editar rol
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm bg-slate-900 border border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Editar usuario</DialogTitle>
          <DialogDescription className="text-slate-400">
            {user.email}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rol</label>
          <Select value={role} onValueChange={(v) => setRole(v as 'ADMIN' | 'USER')}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
              <SelectItem value="ADMIN">ADMIN</SelectItem>
              <SelectItem value="USER">USER</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          {!loading ? (
            <>
              <Button variant="outline" onClick={() => setOpen(false)} className="border-slate-600 text-slate-300 hover:bg-slate-800">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
                Guardar
              </Button>
            </>
          ) : (
            <Spinner className="size-6 text-blue-400" />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
