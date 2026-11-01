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

const items = [
  { label: 'Administrador (ADMIN)', value: 'ADMIN' },
  { label: 'Usuario Lector (USER)', value: 'USER' },
];

const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  lastName: z.string(),
  email: z.string().email('Ingresa un correo valido.'),
  role: z.string().min(1, 'Selecciona un rol.'),
});

export function DialogDemo() {
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
      <form id='form-rhf-demo' onSubmit={form.handleSubmit(onSubmit)}>
        <DialogTrigger
          render={
            <Button
              type='button'
              className='bg-blue-600 hover:bg-blue-700 text-white font-medium'
            >
              + Crear Usuario
            </Button>
          }
        />
        <DialogContent className='sm:max-w-sm bg-slate-900 border border-slate-700 text-slate-100'>
          <DialogHeader>
            <DialogTitle className='text-slate-100'>Crear Usuario</DialogTitle>
            <DialogDescription className='text-slate-400'>
              Registra una nueva cuenta en el sistema de biblioteca.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Controller
              name='name'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor='name-1' className='text-slate-300'>Nombre</Label>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id='name-1'
                    placeholder='Pedro'
                    className='bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500'
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name='lastName'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor='lastName-1' className='text-slate-300'>Apellido</Label>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id='lastName-1'
                    placeholder='Duarte'
                    className='bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500'
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name='email'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor='email-1' className='text-slate-300'>Correo electronico</Label>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id='email-1'
                    type='email'
                    placeholder='pedro@biblioteca.com'
                    className='bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500'
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name='role'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field orientation='responsive' data-invalid={fieldState.invalid}>
                  <FieldLabel className='text-slate-300'>Rol</FieldLabel>
                  <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full max-w-48 bg-slate-800 border-slate-600 text-slate-100'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className='bg-slate-900 border-slate-700 text-slate-100'>
                      <SelectGroup>
                        <SelectLabel className='text-slate-400'>Roles disponibles</SelectLabel>
                        {items.map((item) => (
                          <SelectItem
                            key={item.value}
                            value={item.value}
                            className='hover:bg-slate-800 text-slate-200'
                          >
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
            <Field orientation='horizontal'>
              {!loading ? (
                <>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      form.reset();
                      setOpen(false);
                    }}
                    className='border-slate-600 text-slate-300 hover:bg-slate-800'
                  >
                    Cancelar
                  </Button>
                  <Button
                    type='submit'
                    form='form-rhf-demo'
                    className='bg-blue-600 hover:bg-blue-700 text-white font-medium'
                  >
                    Guardar
                  </Button>
                </>
              ) : (
                <Spinner className='size-8 text-blue-400' />
              )}
            </Field>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
