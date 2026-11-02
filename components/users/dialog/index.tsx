'use client';
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
  FieldLabel,
} from '@/components/ui/field';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from 'next/navigation';
import { IconPlus, IconUserPlus } from '@tabler/icons-react';

const items = [
  { label: 'Administrador (ADMIN)', value: 'ADMIN' },
  { label: 'Usuario Lector (USER)', value: 'USER' },
];

const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  lastName: z.string(),
  email: z.email('Ingresa un correo valido.'),
  role: z.string().min(1, 'Selecciona un rol.'),
});

// DialogCrearUsuario registra una nueva cuenta de usuario
export function DialogCrearUsuario() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      role: 'USER',
    },
  });

  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: data }),
      });

      if (!response.ok) {
        throw new Error('Error al crear usuario');
      }

      toast.success('Usuario creado exitosamente');
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      toast.error('Error al crear usuario. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form id="form-crear-usuario" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogTrigger
          render={
            <Button type="button">
              <IconPlus />
              Crear Usuario
            </Button>
          }
        />
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconUserPlus className="size-4 text-primary" />
              Crear Usuario
            </DialogTitle>
            <DialogDescription>
              Registra una nueva cuenta en el sistema de biblioteca.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="name-1">Nombre</Label>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id="name-1"
                    placeholder="Pedro"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="lastName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="lastName-1">Apellido</Label>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id="lastName-1"
                    placeholder="Duarte"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="email-1">Correo electronico</Label>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id="email-1"
                    type="email"
                    placeholder="pedro@biblioteca.com"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field orientation="responsive" data-invalid={fieldState.invalid}>
                  <FieldLabel>Rol</FieldLabel>
                  <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full max-w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Roles disponibles</SelectLabel>
                        {items.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Field orientation="horizontal">
              {!loading ? (
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
                  <Button type="submit" form="form-crear-usuario">
                    Guardar
                  </Button>
                </>
              ) : (
                <Spinner />
              )}
            </Field>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
