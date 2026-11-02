'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

// Acciones del header publico: tema y acceso al login (este ultimo solo fuera de /login).
export function PublicNavActions() {
  const pathname = usePathname();
  const enLogin = pathname === '/login';

  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      {!enLogin && (
        <Button nativeButton={false} render={<Link href="/login" />}>
          Iniciar sesion
        </Button>
      )}
    </div>
  );
}
