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

// DialogCrearMaestro permite a los administradores registrar nuevos libros en el inventario
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

      toast.success('Maestro creado exitosamente en Supabase');
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error creando maestro:', error);
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
            <Button
              type="button"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-blue-900/30 px-4 py-2 rounded-lg text-sm transition-all"
            >
              <IconPlus className="size-4" />
              <span>Nuevo Maestro</span>
            </Button>
          }
        />
        <DialogContent className="sm:max-w-md bg-slate-900/95 border border-slate-800 text-slate-100 shadow-2xl backdrop-blur-xl rounded-xl">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <IconBook2 className="size-4" />
              </div>
              <DialogTitle className="text-slate-100 text-lg font-bold">
                Registrar Nuevo Maestro
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-400 text-xs">
              Agrega un libro o material bibliografico con su existencia inicial.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-4 py-2">
            {/* Nombre del libro */}
            <Controller
              name="nombre"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="maestro-nombre" className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <IconBook2 className="size-3.5 text-blue-400" />
                    Titulo del Libro / Obra
                  </Label>
                  <Input
                    {...field}
                    id="maestro-nombre"
                    placeholder="Ej: Estructuras de Datos y Algoritmos"
                    aria-invalid={fieldState.invalid}
                    className="bg-slate-950/80 border-slate-700/80 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 text-sm h-10"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Saldo inicial */}
            <Controller
              name="saldo"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="maestro-saldo" className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <IconPackage className="size-3.5 text-blue-400" />
                    Saldo inicial (Unidades disponibles)
                  </Label>
                  <Input
                    id="maestro-saldo"
                    type="number"
                    min={0}
                    placeholder="1"
                    aria-invalid={fieldState.invalid}
                    className="bg-slate-950/80 border-slate-700/80 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 text-sm h-10 font-mono"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-800/80">
            <Field orientation="horizontal" className="flex items-center justify-end gap-2 w-full">
              {loading ? (
                <Button disabled className="bg-blue-600 text-white">
                  <Spinner className="size-4 mr-2" />
                  Guardando en Supabase...
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
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    form="form-maestro"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-blue-900/30"
                  >
                    Guardar Maestro
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
