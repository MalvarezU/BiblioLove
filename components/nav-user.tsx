'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { IconSelector, IconLogout, IconShieldCheck, IconUser } from '@tabler/icons-react';

type UsuarioSesion = {
  id: string;
  name: string;
  email: string;
  role: string;
};

// NavUser muestra la cuenta autenticada con menu desplegable para cerrar sesion
export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const raw = localStorage.getItem('session_user');
      if (raw) {
        try {
          setUsuario(JSON.parse(raw));
        } catch {
          // Fallback silencioso
        }
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  async function handleLogout() {
    try {
      await fetch('/api/login', { method: 'DELETE' });
      localStorage.removeItem('session_user');
      toast.success('Sesion cerrada correctamente');
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesion:', error);
      toast.error('Error al cerrar sesion');
    }
  }

  if (!usuario) {
    return null;
  }

  const iniciales = usuario.name.slice(0, 2).toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="aria-expanded:bg-sidebar-accent group-data-[collapsible=icon]:justify-center"
              />
            }
          >
            <Avatar className="size-8 rounded-md">
              <AvatarFallback className="rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                {iniciales}
              </AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-semibold">{usuario.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {usuario.email}
              </span>
            </div>
            <IconSelector className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-60"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={6}
          >
            <DropdownMenuLabel className="p-2 font-normal">
              <div className="flex items-center gap-3">
                <Avatar className="size-9 rounded-md">
                  <AvatarFallback className="rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                    {iniciales}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm">
                  <span className="truncate font-semibold">{usuario.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {usuario.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <div className="flex items-center justify-between px-2 py-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                {usuario.role === 'ADMIN' ? (
                  <IconShieldCheck className="size-4 text-primary" />
                ) : (
                  <IconUser className="size-4" />
                )}
                Rol
              </span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                  usuario.role === 'ADMIN'
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {usuario.role}
              </span>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <IconLogout className="size-4" />
              <span>Cerrar sesion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
