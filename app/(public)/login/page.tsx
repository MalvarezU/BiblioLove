import { LoginForm } from '@/components/login-form';

// Pagina de autenticacion de BiblioLove.
export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100svh-3.5rem-4.5rem)] items-center justify-center px-6 py-12">
      <LoginForm />
    </div>
  );
}
