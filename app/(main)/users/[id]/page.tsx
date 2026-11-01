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
      toast.error('Failed to load user data. Please try again.');
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
      }).then((res) => {
        toast.success('User created successfully');
        setLoading(false);

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
  if (!userData) {
    return <Spinner className='size-8' />;
  }

  return (
    <div className=' '>
      <form id='form-rhf-demo' onSubmit={form.handleSubmit(onSubmit)}>
        <Card className='w-full sm:max-w-md'>
          <CardHeader>
            <CardTitle>Create User</CardTitle>
            <CardDescription>
              Make changes to your profile here. Click save when you&apos;re done.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                name='name'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Label htmlFor='name-1'>Name</Label>
                    <Input {...field} aria-invalid={fieldState.invalid} id='name-1' name='name' />
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
          </CardContent>
          <CardFooter>
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
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default Edit;
