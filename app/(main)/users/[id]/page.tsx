'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldContent,
  FieldDescription,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { IconArrowLeft, IconUserEdit } from '@tabler/icons-react';
import Link from 'next/link';

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

// Edicion de un usuario existente
const Edit = () => {
  const params = useParams<{ id: string }>();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      role: '',
    },
  });
  const { reset } = form;
  const [loading, setLoading] = React.useState(false);
  const [userData, setUserData] = React.useState<{
    createdAt: string;
    deleted: boolean;
    email: string;
    enabled: boolean;
    id: string;
    lastName: string;
    name: string;
    password: string;
    role: 'ADMIN' | 'USER';
    updatedAt: string;
  } | null>(null);

  async function fetchUserData(userID: string) {
    try {
      const response = await fetch(`/api/user?id=${userID}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error Fetching user data', error);
      toast.error('No se pudo cargar el usuario. Intenta de nuevo.');
      return null;
    }
  }

  React.useEffect(() => {
    if (!params.id) return;
    let active = true;
    async function loadUser() {
      const data = await fetchUserData(params.id);

      if (!active || !data) return;

      setUserData(data);

      reset({
        name: data.name ?? '',
        lastName: data.lastName ?? '',
        email: data.email ?? '',
        role: data.role ?? '',
      });
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, [params.id, reset]);

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
        throw new Error('Failed to update user');
      }

      toast.success('Cambios guardados exitosamente');
    } catch (error) {
      console.error('Error submitting form', error);
      toast.error('Error al actualizar el usuario. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconUserEdit className="size-5" />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Editar Usuario
            </h1>
            <p className="text-xs text-muted-foreground">{userData.email}</p>
          </div>
        </div>
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href="/users" />}
        >
          <IconArrowLeft />
          Volver
        </Button>
      </div>

      <form id="form-editar-usuario" onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-full sm:max-w-md">
          <CardHeader>
            <CardTitle>Datos del usuario</CardTitle>
            <CardDescription>
              Modifica la informacion de la cuenta. Guarda los cambios cuando
              estes listo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Label htmlFor="name-1">Nombre</Label>
                    <Input {...field} aria-invalid={fieldState.invalid} id="name-1" name="name" />
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
                      name="lastName"
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
                      name="email"
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
                    <FieldContent>
                      <FieldLabel htmlFor="form-editar-rol">Rol</FieldLabel>
                      <FieldDescription>Selecciona el rol del usuario.</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </FieldContent>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="form-editar-rol" className="w-full max-w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Rol</SelectLabel>
                          {items.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Field orientation="horizontal">
              {!loading ? (
                <>
                  <Button type="button" variant="outline" onClick={() => form.reset()}>
                    Restablecer
                  </Button>
                  <Button type="submit" form="form-editar-usuario">
                    Guardar cambios
                  </Button>
                </>
              ) : (
                <Spinner />
              )}
            </Field>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default Edit;
