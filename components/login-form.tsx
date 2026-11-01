'use client';

import { cn } from 'cn';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { IconBook2, IconLock, IconMail, IconSparkles } from '@tabler/icons-react';

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
    <div className={cn('flex flex-col gap-6 w-full max-w-4xl mx-auto', className)} {...props}>
      <Card className="overflow-hidden p-0 bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl rounded-2xl">
        <CardContent className="grid p-0 md:grid-cols-5">
          {/* Formulario de autenticacion */}
          <form
            className="p-8 md:p-10 flex flex-col justify-between gap-6 md:col-span-3"
            onSubmit={handleSubmit}
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-900/40">
                  <IconBook2 className="size-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
                    BiblioLove
                  </h1>
                  <p className="text-xs font-mono text-slate-400">
                    Sistema de Gestion de Biblioteca
                  </p>
                </div>
              </div>
            </div>

            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <IconMail className="size-3.5 text-blue-400" />
                  Correo electronico
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@biblioteca.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-950/70 border-slate-700/80 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 h-10 text-sm"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <IconLock className="size-3.5 text-blue-400" />
                  Contrasena
                </FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-950/70 border-slate-700/80 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 h-10 text-sm"
                />
              </Field>

              <div className="pt-2">
                {loading ? (
                  <Button
                    disabled
                    className="w-full bg-blue-600 text-white font-medium h-10"
                  >
                    <Spinner className="size-4 mr-2" />
                    Validando credenciales...
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold h-10 shadow-lg shadow-blue-900/30 transition-all duration-200"
                  >
                    Iniciar sesion
                  </Button>
                )}
              </div>
            </FieldGroup>

            {/* Accesos rapidos de prueba */}
            <div className="border-t border-slate-800/80 pt-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                <IconSparkles className="size-3.5 text-blue-400" />
                <span>Credenciales de prueba:</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => autoFill('admin@biblioteca.com', 'admin123')}
                  className="flex-1 text-xs py-1.5 px-2 rounded-md border border-slate-800 bg-slate-950/50 hover:bg-slate-800 hover:border-slate-700 text-slate-300 font-mono transition-colors text-center"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => autoFill('lector@biblioteca.com', 'user123')}
                  className="flex-1 text-xs py-1.5 px-2 rounded-md border border-slate-800 bg-slate-950/50 hover:bg-slate-800 hover:border-slate-700 text-slate-300 font-mono transition-colors text-center"
                >
                  Lector (User)
                </button>
              </div>
            </div>
          </form>

          {/* Panel decorativo con estetica de programador */}
          <div className="relative hidden md:flex md:col-span-2 flex-col justify-between p-8 bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-950 border-l border-slate-800/80 overflow-hidden">
            {/* Patron de fondo sutil */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-mono text-blue-400 mb-4">
                <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
                Next.js + Supabase
              </span>
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                Control y Gestion de Libros
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Administracion centralizada de inventario bibliotecario, control de saldos y usuarios.
              </p>
            </div>

            <div className="relative z-10 rounded-xl border border-slate-800/90 bg-slate-950/80 p-4 font-mono text-[11px] text-slate-400 shadow-lg">
              <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-800">
                <span className="size-2 rounded-full bg-red-500/80" />
                <span className="size-2 rounded-full bg-yellow-500/80" />
                <span className="size-2 rounded-full bg-green-500/80" />
                <span className="text-[10px] text-slate-500 ml-2">bibliolove.config.ts</span>
              </div>
              <div className="space-y-0.5 text-slate-400">
                <p className="text-blue-400">const stack = &#123;</p>
                <p className="pl-3">framework: <span className="text-emerald-300">&apos;Next.js 16&apos;</span>,</p>
                <p className="pl-3">orm: <span className="text-emerald-300">&apos;Prisma 7&apos;</span>,</p>
                <p className="pl-3">database: <span className="text-emerald-300">&apos;PostgreSQL&apos;</span></p>
                <p className="text-blue-400">&#125;;</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
