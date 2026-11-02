'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { IconPlus, IconUserPlus, IconLock, IconEye, IconEyeOff } from '@tabler/icons-react';

const roles = [
  { label: 'Administrador (ADMIN)', value: 'ADMIN' },
  { label: 'Usuario Lector (USER)', value: 'USER' },
];

const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  lastName: z.string(),
  email: z.string().email('Ingresa un correo válido.'),
  password: z.string().min(4, 'La contraseña debe tener al menos 4 caracteres.'),
  role: z.string().min(1, 'Selecciona un rol.'),
});

type FormValues = z.infer<typeof formSchema>;

// DialogCrearUsuario registra una nueva cuenta de usuario con contraseña configurable
export function DialogCrearUsuario() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      password: '',
      role: 'USER',
    },
  });

  async function onSubmit(data: FormValues) {
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
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Error al crear usuario');
      }

      toast.success('Usuario creado exitosamente');
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al crear usuario. Intenta de nuevo.'
      );
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
              <IconPlus className="size-4" />
              Crear Usuario
            </Button>
          }
        />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconUserPlus className="size-5 text-primary" />
              Crear Usuario
            </DialogTitle>
            <DialogDescription>
              Registra una nueva cuenta con credenciales de acceso al sistema.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-3 py-2">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="name-input">Nombre</Label>
                  <Input
                    {...field}
                    id="name-input"
                    placeholder="Pedro"
                    aria-invalid={fieldState.invalid}
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
                  <Label htmlFor="lastName-input">Apellido</Label>
                  <Input
                    {...field}
                    id="lastName-input"
                    placeholder="Duarte"
                    aria-invalid={fieldState.invalid}
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
                  <Label htmlFor="email-input">Correo Electrónico</Label>
                  <Input
                    {...field}
                    id="email-input"
                    type="email"
                    placeholder="usuario@biblioteca.com"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="password-input" className="flex items-center gap-1.5">
                    <IconLock className="size-3.5 text-muted-foreground" />
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      {...field}
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 4 caracteres"
                      aria-invalid={fieldState.invalid}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <IconEyeOff className="size-4" />
                      ) : (
                        <IconEye className="size-4" />
                      )}
                    </button>
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Rol asignado</FieldLabel>
                  <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Roles disponibles</SelectLabel>
                        {roles.map((item) => (
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

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => {
                form.reset();
                setOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" form="form-crear-usuario" disabled={loading}>
              {loading && <Spinner className="size-4 mr-2" />}
              {loading ? 'Guardando...' : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
