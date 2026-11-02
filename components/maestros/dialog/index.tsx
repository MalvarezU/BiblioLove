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
import {
  Field,
  FieldError,
  FieldGroup,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { IconPlus, IconBook2, IconPackage } from '@tabler/icons-react';

// Esquema de validacion
const formSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  saldo: z
    .number()
    .min(0, 'El saldo inicial no puede ser negativo.'),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  userId: string;
};

// DialogCrearMaestro permite a los administradores registrar nuevos libros
export function DialogCrearMaestro({ userId }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      saldo: 1,
    },
  });

  async function onSubmit(data: FormValues) {
    setLoading(true);
    try {
      const response = await fetch('/api/maestros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId }),
      });

      if (!response.ok) {
        throw new Error('Respuesta invalida del servidor');
      }

      toast.success('Libro registrado exitosamente');
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error creando libro:', error);
      toast.error('Error al registrar el libro. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form id="form-maestro" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogTrigger
          render={
            <Button type="button">
              <IconPlus />
              Nuevo Libro
            </Button>
          }
        />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconBook2 className="size-4 text-primary" />
              Registrar Nuevo Libro
            </DialogTitle>
            <DialogDescription>
              Agrega un libro o material bibliografico con su existencia inicial.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Controller
              name="nombre"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="maestro-nombre" className="flex items-center gap-1.5">
                    <IconBook2 className="size-3.5 text-primary" />
                    Titulo del Libro / Obra
                  </Label>
                  <Input
                    {...field}
                    id="maestro-nombre"
                    placeholder="Ej: Estructuras de Datos y Algoritmos"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="saldo"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="maestro-saldo" className="flex items-center gap-1.5">
                    <IconPackage className="size-3.5 text-primary" />
                    Saldo inicial (Unidades disponibles)
                  </Label>
                  <Input
                    id="maestro-saldo"
                    type="number"
                    min={0}
                    placeholder="1"
                    aria-invalid={fieldState.invalid}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Field orientation="horizontal">
              {loading ? (
                <Button disabled>
                  <Spinner />
                  Guardando...
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setOpen(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" form="form-maestro">
                    Guardar Libro
                  </Button>
                </>
              )}
            </Field>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
