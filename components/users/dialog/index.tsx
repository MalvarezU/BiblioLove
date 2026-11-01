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
import React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from 'next/navigation';

const items = [
  { label: 'Administrator', value: 'ADMIN' },
  { label: 'User', value: 'USER' },
];

const formSchema = z.object({
  name: z.string().min(2, 'name  must be at least 2 characters.'),
  lastName: z.string(),
  email: z.email(),
  role: z.string().min(1, 'Please select your role.'),
});

export function DialogDemo() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      role: '',
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
      }).then((res) => {
        toast.success('User created successfully');
        setLoading(false);
        router.push('/users');
        setOpen(false);
        return res;
      });

      if (!response.ok) {
        setLoading(false);
        throw new Error('Failed to create user');
      }
    } catch (error) {
      console.error('Error submitting  form', error);
      toast.error('Failed to create user, Please try again');
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form id='form-rhf-demo' onSubmit={form.handleSubmit(onSubmit)}>
        <DialogTrigger render={<Button type='button'>CREAR USUARIO</Button>} />
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Controller
              name='name'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor='name-1'>Name</Label>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id='name-1'
                    name='name'
                    defaultValue='Pedro'
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
                  <Label htmlFor='lastName-1'>LastName</Label>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id='lastName-1'
                    name='lastName'
                    defaultValue='Duarte'
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
                  <Label htmlFor='email-1'>Email</Label>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id='email-1'
                    type='email'
                    name='email'
                    defaultValue='Duarte@example.com'
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
                  <FieldContent>
                    <FieldLabel htmlFor='form-rhf-select-language'>Role</FieldLabel>
                    <FieldDescription>Select Role.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldContent>
                  <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full max-w-48'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Role</SelectLabel>
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
          <DialogFooter>
            <Field orientation='horizontal'>
              {!loading ? (
                <>
                  <Button type='button' variant='outline' onClick={() => form.reset()}>
                    Reset
                  </Button>
                  <Button type='submit' form='form-rhf-demo'>
                    Submit
                  </Button>
                </>
              ) : (
                <Spinner className='size-8' />
              )}
            </Field>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
