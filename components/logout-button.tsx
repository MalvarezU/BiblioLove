'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { IconLogout } from '@tabler/icons-react';

type Props = {
  variant?: 'ghost' | 'outline' | 'secondary';
  size?: 'icon-sm' | 'icon' | 'sm';
  className?: string;
  showLabel?: boolean;
};

// Cierra la sesion actual: borra la cookie de sesion y el usuario en localStorage.
export function LogoutButton({
  variant = 'ghost',
  size = 'icon-sm',
  className,
  showLabel = false,
}: Props) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch('/api/login', { method: 'DELETE' });
      localStorage.removeItem('session_user');
      toast.success('Sesion cerrada correctamente');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesion:', error);
      toast.error('Error al cerrar sesion');
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      aria-label="Cerrar sesion"
      title="Cerrar sesion"
      onClick={handleLogout}
    >
      <IconLogout />
      {showLabel && (
        <span className="group-data-[collapsible=icon]:hidden">Cerrar sesion</span>
      )}
    </Button>
  );
}
