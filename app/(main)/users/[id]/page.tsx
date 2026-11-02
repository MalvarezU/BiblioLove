'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { IconArrowLeft, IconUserEdit, IconLock } from '@tabler/icons-react';

const roles = [
  { label: 'Administrador (ADMIN)', value: 'ADMIN' },
  { label: 'Usuario Lector (USER)', value: 'USER' },
];

const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  lastName: z.string().optional(),
  email: z.string().email('Ingresa un correo electrónico válido.'),
  role: z.string().min(1, 'Selecciona un rol.'),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 4, {
      message: 'Si deseas cambiar la contraseña, debe tener al menos 4 caracteres.',
    }),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      role: 'USER',
      password: '',
    },
  });

  const { reset } = form;
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [userEmail, setUserEmail] = React.useState<string>('');

  React.useEffect(() => {
    if (!params?.id) return;
    let active = true;

    async function loadUser() {
      try {
        const response = await fetch(`/api/users/${params.id}`);
        if (!response.ok) {
          throw new Error('No se pudo cargar la información del usuario');
        }
        const data = await response.json();
        const user = data.user;

        if (!active || !user) return;

        setUserEmail(user.email);
        reset({
          name: user.name ?? '',
          lastName: user.lastName ?? '',
          email: user.email ?? '',
          role: user.role ?? 'USER',
          password: '',
        });
      } catch (error) {
        console.error('Error cargando usuario:', error);
        toast.error('No se pudo cargar el usuario.');
      } finally {
        if (active) setInitialLoading(false);
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, [params?.id, reset]);

  async function onSubmit(data: FormValues) {
    if (!params?.id) return;
    setLoading(true);

    try {
      const payload: Record<string, string | null | undefined> = {
        name: data.name,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
      };

      if (data.password && data.password.trim() !== '') {
        payload.password = data.password.trim();
      }

      const response = await fetch(`/api/users/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || 'Error al actualizar usuario');
      }

      toast.success('Usuario actualizado exitosamente');
      router.push('/users');
      router.refresh();
    } catch (error) {
      console.error('Error enviando formulario:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al actualizar el usuario. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Spinner className="size-8 text-primary" />
        <p className="text-sm text-muted-foreground">Cargando usuario...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconUserEdit className="size-5" />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Editar Usuario
            </h1>
            <p className="text-xs text-muted-foreground">{userEmail || 'Modificar datos de la cuenta'}</p>
          </div>
        </div>
        <Button
          nativeButton={false}
          variant="outline"
          size="sm"
          render={<Link href="/users" />}
          className="gap-1.5 text-xs"
        >
          <IconArrowLeft className="size-3.5" />
          Volver
        </Button>
      </div>

      <form id="form-editar-usuario" onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Información del Usuario</CardTitle>
            <CardDescription>
              Modifica los datos personales, rol del sistema o actualiza la contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="space-y-4">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Label htmlFor="user-name">Nombre</Label>
                    <Input {...field} aria-invalid={fieldState.invalid} id="user-name" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="lastName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Label htmlFor="user-lastName">Apellido</Label>
                    <Input {...field} aria-invalid={fieldState.invalid} id="user-lastName" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Label htmlFor="user-email">Correo Electrónico</Label>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="user-email"
                      type="email"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="role"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Rol en el Sistema</FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="user-role" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Roles</SelectLabel>
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

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Label htmlFor="user-password" className="flex items-center gap-1.5">
                      <IconLock className="size-3.5 text-muted-foreground" />
                      Nueva Contraseña (opcional)
                    </Label>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="user-password"
                      type="password"
                      placeholder="Dejar en blanco para mantener la actual"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => form.reset()}
            >
              Restablecer
            </Button>
            <Button type="submit" form="form-editar-usuario" disabled={loading}>
              {loading && <Spinner className="size-4 mr-2" />}
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
