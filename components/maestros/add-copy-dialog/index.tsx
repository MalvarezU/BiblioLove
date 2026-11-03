'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { IconCopyPlus } from '@tabler/icons-react';

const formSchema = z.object({
  publisher: z.string().min(2, 'La editorial es requerida.'),
  quantity: z.number().min(1, 'Agrega al menos un ejemplar.'),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  libro: { id: string; title: string };
  userId: string;
};

export function DialogAgregarEjemplar({ libro, userId }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      publisher: '',
      quantity: 1,
    },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) form.reset({ publisher: '', quantity: 1 });
  }

  async function onSubmit(data: FormValues) {
    setLoading(true);
    try {
      const response = await fetch(`/api/books/${libro.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publisher: data.publisher,
          quantity: data.quantity,
          userId,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'No se pudieron agregar los ejemplares');
      }

      toast.success('Ejemplares agregados correctamente');
      setOpen(false);
      form.reset({ publisher: '', quantity: 1 });
      router.refresh();
    } catch (error) {
      console.error('Error agregando ejemplares:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al agregar ejemplares'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            title="Agregar ejemplar"
            aria-label="Agregar ejemplar"
          >
            <IconCopyPlus className="size-4" />
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <form id={`form-agregar-ejemplar-${libro.id}`} onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Agregar Ejemplares</DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Libro: <strong>{libro.title}</strong>. Puedes registrar varias
              unidades de una misma editorial.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-3 py-4">
            <Controller
              name="publisher"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor={`copy-publisher-${libro.id}`}>Editorial</Label>
                  <Input
                    {...field}
                    id={`copy-publisher-${libro.id}`}
                    placeholder="Ej: Sudamericana"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="quantity"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor={`copy-quantity-${libro.id}`}>Cantidad</Label>
                  <Input
                    id={`copy-quantity-${libro.id}`}
                    type="number"
                    min={1}
                    aria-invalid={fieldState.invalid}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

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
              type="submit"
              form={`form-agregar-ejemplar-${libro.id}`}
              disabled={loading}
            >
              {loading && <Spinner className="size-4 mr-2" />}
              {loading ? 'Guardando...' : 'Agregar Ejemplares'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
