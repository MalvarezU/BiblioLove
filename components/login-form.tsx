'use client';

import { cn } from 'cn';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { IconBook2 } from '@tabler/icons-react';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? 'Error al iniciar sesion');
        return;
      }

      localStorage.setItem('session_user', JSON.stringify(data.user));
      toast.success(`Bienvenido, ${data.user.name}`);
      router.push('/home');
    } catch (error) {
      console.error('Error en login:', error);
      toast.error('No fue posible iniciar sesion. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // Permite auto-completar credenciales de prueba con un clic
  function autoFill(userEmail: string, userPass: string) {
    setEmail(userEmail);
    setPassword(userPass);
  }

  return (
    <div className={cn('w-full max-w-md', className)} {...props}>
      <Card>
        <CardHeader className="items-center text-center">
          <div className="mb-1 flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <IconBook2 className="size-6" />
          </div>
          <CardTitle className="font-heading text-xl">BiblioLove</CardTitle>
          <CardDescription>
            Inicia sesion para acceder a tu biblioteca
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Correo electronico</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@biblioteca.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Contrasena</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>

              <Field>
                {loading ? (
                  <Button disabled className="w-full">
                    <Spinner />
                    Validando credenciales...
                  </Button>
                ) : (
                  <Button type="submit" className="w-full">
                    Iniciar sesion
                  </Button>
                )}
              </Field>
            </FieldGroup>
          </form>

          <div className="mt-6 border-t border-border pt-4">
            <p className="mb-2 text-center text-xs text-muted-foreground">
              Credenciales de prueba
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => autoFill('admin@biblioteca.com', 'admin123')}
              >
                Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => autoFill('lector@biblioteca.com', 'user123')}
              >
                Lector
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
