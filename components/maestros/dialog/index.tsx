'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useForm, useWatch, Controller } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconPlus, IconBook2, IconUserPlus } from '@tabler/icons-react';

type Categoria = { id: number; name: string };
type Genero = { id: number; name: string };
type Autor = { id: number; name: string; lastName: string };

const NUEVO_AUTOR = '__nuevo__';

const formSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres.'),
  categoryId: z.string().min(1, 'Selecciona una categoría.'),
  genreId: z.string().min(1, 'Selecciona un género.'),
  authorId: z.string().min(1, 'Selecciona un autor.'),
  publisher: z.string().min(2, 'La editorial es requerida.'),
  newAuthorName: z.string().optional(),
  newAuthorLastName: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  userId: string;
  categorias: Categoria[];
  generos: Genero[];
  autores: Autor[];
};

export function DialogCrearLibro({ userId, categorias, generos, autores }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [duplicado, setDuplicado] = React.useState<{ id: string; title: string } | null>(
    null
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      categoryId: '',
      genreId: '',
      authorId: '',
      publisher: '',
      newAuthorName: '',
      newAuthorLastName: '',
    },
  });

  const authorId = useWatch({ control: form.control, name: 'authorId' });
  const esNuevoAutor = authorId === NUEVO_AUTOR;

  const autorItems = [
    ...autores.map((a) => ({
      value: String(a.id),
      label: `${a.name} ${a.lastName}`,
    })),
    { value: NUEVO_AUTOR, label: 'Nuevo autor' },
  ];

  function cerrarTodo() {
    setConfirmOpen(false);
    setDuplicado(null);
    setOpen(false);
    form.reset();
  }

  async function onSubmit(data: FormValues) {
    if (data.authorId === NUEVO_AUTOR && (!data.newAuthorName?.trim() || !data.newAuthorLastName?.trim())) {
      toast.error('Ingresa el nombre y apellido del nuevo autor.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          categoryId: Number(data.categoryId),
          genreId: Number(data.genreId),
          authorId: data.authorId === NUEVO_AUTOR ? undefined : Number(data.authorId),
          newAuthor:
            data.authorId === NUEVO_AUTOR
              ? {
                  name: data.newAuthorName?.trim(),
                  lastName: data.newAuthorLastName?.trim(),
                }
              : undefined,
          publisher: data.publisher,
          userId,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (response.status === 409 && payload?.code === 'BOOK_EXISTS') {
        setDuplicado(payload.book);
        setConfirmOpen(true);
        return;
      }

      if (!response.ok) {
        throw new Error(payload?.error || 'Respuesta inválida del servidor');
      }

      toast.success('Libro registrado con su primer ejemplar');
      cerrarTodo();
      router.refresh();
    } catch (error) {
      console.error('Error creando libro:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al registrar el libro. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function agregarEjemplarExistente() {
    if (!duplicado) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/books/${duplicado.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publisher: form.getValues('publisher'),
          quantity: 1,
          userId,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'No se pudo agregar el ejemplar');
      }

      toast.success('Ejemplar agregado al libro existente');
      cerrarTodo();
      router.refresh();
    } catch (error) {
      console.error('Error agregando ejemplar:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al agregar el ejemplar'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setDuplicado(null);
            setConfirmOpen(false);
          }
        }}
      >
        <form id="form-libro" onSubmit={form.handleSubmit(onSubmit)}>
          <DialogTrigger
            render={
              <Button type="button">
                <IconPlus className="size-4" />
                Nuevo Libro
              </Button>
            }
          />
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <IconBook2 className="size-5 text-primary" />
                Registrar Nuevo Libro
              </DialogTitle>
              <DialogDescription className="text-xs">
                Crea la obra y su primer ejemplar. Los demás ejemplares se agregan
                desde el catálogo.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup className="space-y-3 py-2">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Label htmlFor="libro-title">Título del libro</Label>
                    <Input
                      {...field}
                      id="libro-title"
                      placeholder="Ej: Cien años de soledad"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Controller
                  name="categoryId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Label>Categoría</Label>
                      <Select
                        items={categorias.map((c) => ({
                          value: String(c.id),
                          label: c.name,
                        }))}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full text-xs" aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="genreId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Label>Género</Label>
                      <Select
                        items={generos.map((g) => ({
                          value: String(g.id),
                          label: g.name,
                        }))}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full text-xs" aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          {generos.map((g) => (
                            <SelectItem key={g.id} value={String(g.id)} className="text-xs">
                              {g.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="authorId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Label>Autor</Label>
                    <Select
                      items={autorItems}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full text-xs" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Selecciona o crea un autor" />
                      </SelectTrigger>
                      <SelectContent>
                        {autores.map((a) => (
                          <SelectItem key={a.id} value={String(a.id)} className="text-xs">
                            {a.name} {a.lastName}
                          </SelectItem>
                        ))}
                        <SelectItem value={NUEVO_AUTOR} className="text-xs">
                          <IconUserPlus className="size-3.5" />
                          Nuevo autor
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {esNuevoAutor && (
                <div className="grid grid-cols-2 gap-3">
                  <Controller
                    name="newAuthorName"
                    control={form.control}
                    render={({ field }) => (
                      <Field>
                        <Label htmlFor="nuevo-autor-nombre">Nombre</Label>
                        <Input
                          {...field}
                          id="nuevo-autor-nombre"
                          placeholder="Gabriel"
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name="newAuthorLastName"
                    control={form.control}
                    render={({ field }) => (
                      <Field>
                        <Label htmlFor="nuevo-autor-apellido">Apellido</Label>
                        <Input
                          {...field}
                          id="nuevo-autor-apellido"
                          placeholder="García Márquez"
                        />
                      </Field>
                    )}
                  />
                </div>
              )}

              <Controller
                name="publisher"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Label htmlFor="libro-publisher">Editorial del primer ejemplar</Label>
                    <Input
                      {...field}
                      id="libro-publisher"
                      placeholder="Ej: Sudamericana"
                      aria-invalid={fieldState.invalid}
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
                onClick={cerrarTodo}
              >
                Cancelar
              </Button>
              <Button type="submit" form="form-libro" disabled={loading}>
                {loading && <Spinner className="size-4 mr-2" />}
                {loading ? 'Guardando...' : 'Guardar Libro'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onOpenChange={(next) => {
          if (!next) cerrarTodo();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>El libro ya existe</DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Ya hay un libro registrado como <strong>{duplicado?.title}</strong>.
              ¿Deseas registrar un nuevo ejemplar de esta obra?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" disabled={loading} onClick={cerrarTodo}>
              No, cancelar
            </Button>
            <Button type="button" disabled={loading} onClick={agregarEjemplarExistente}>
              {loading && <Spinner className="size-4 mr-2" />}
              Sí, agregar ejemplar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
