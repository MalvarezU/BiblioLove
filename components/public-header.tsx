'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { IconBook2, IconSearch } from '@tabler/icons-react';

// Header publico inspirado en el banner de referencia: navegacion principal,
// buscador visual y acciones de tema/sesion.
export function PublicHeader() {
  const pathname = usePathname();
  const enLogin = pathname === '/login';

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <IconBook2 className="size-5" />
          </span>
          <span className="font-heading text-xl font-semibold tracking-tight">
            Biblio<span className="italic text-primary">Love</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {!enLogin && (
            <Link
              href="/login"
              className="hidden h-10 w-56 items-center gap-2 rounded-full border border-border bg-muted/50 px-4 text-sm text-muted-foreground transition-colors hover:bg-muted lg:flex"
            >
              <IconSearch className="size-4" />
              Buscar título o autor...
            </Link>
          )}
          <ThemeToggle />
          {!enLogin && (
            <Button nativeButton={false} render={<Link href="/login" />}>
              Iniciar sesión
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
