import { LoginForm } from '@/components/login-form';

// Pagina de autenticacion de BiblioLove.
// Diseno centrado con fondo oscuro sutil y patron de cuadricula tenue.
export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-slate-950 p-6 md:p-10 overflow-hidden">
      {/* Glow ambiental de fondo */}
      <div className="absolute top-1/4 -left-32 size-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 size-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      {/* Cuadricula tenue */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl">
        <LoginForm />
      </div>
    </div>
  );
}
