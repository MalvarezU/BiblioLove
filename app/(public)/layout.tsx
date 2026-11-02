import Link from 'next/link';
import { IconBook2 } from '@tabler/icons-react';
import { PublicNavActions } from '@/components/public-nav-actions';

// Layout de las paginas publicas (landing y login): header simple con
// marca, cambio de tema y acceso al inicio de sesion.
export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <IconBook2 className="size-4.5" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight">
              BiblioLove
            </span>
          </Link>
          <PublicNavActions />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-1 px-6 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <span className="font-medium text-foreground">BiblioLove</span>
          <span>Sistema de gestion de biblioteca</span>
        </div>
      </footer>
    </div>
  );
}
