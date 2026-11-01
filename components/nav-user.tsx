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
    const raw = localStorage.getItem('session_user');
    if (raw) {
      try {
        setUsuario(JSON.parse(raw));
      } catch {
        // Fallback silencioso
      }
    }
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
                className="aria-expanded:bg-slate-900 text-slate-300 hover:bg-slate-900 rounded-lg p-2 transition-colors border border-transparent hover:border-slate-800"
              />
            }
          >
            <Avatar className="size-8 rounded-md ring-1 ring-blue-500/30">
              <AvatarFallback className="rounded-md bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-xs font-bold">
                {iniciales}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-slate-200">{usuario.name}</span>
              <span className="truncate text-xs text-slate-500">{usuario.email}</span>
            </div>
            <IconSelector className="ml-auto size-4 text-slate-500" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-60 bg-slate-900/95 border-slate-800 text-slate-200 shadow-xl backdrop-blur-md"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={6}
          >
            <DropdownMenuLabel className="p-2 font-normal">
              <div className="flex items-center gap-3">
                <Avatar className="size-9 rounded-md ring-1 ring-blue-500/30">
                  <AvatarFallback className="rounded-md bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-xs font-bold">
                    {iniciales}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm">
                  <span className="truncate font-semibold text-slate-100">{usuario.name}</span>
                  <span className="truncate text-xs text-slate-400">{usuario.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-slate-800" />

            <div className="px-2 py-1.5 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                {usuario.role === 'ADMIN' ? (
                  <IconShieldCheck className="size-4 text-blue-400" />
                ) : (
                  <IconUser className="size-4 text-slate-400" />
                )}
                Rol
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                  usuario.role === 'ADMIN'
                    ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {usuario.role}
              </span>
            </div>

            <DropdownMenuSeparator className="bg-slate-800" />

            <DropdownMenuItem
              className="text-red-400 hover:text-red-300 hover:bg-red-950/40 cursor-pointer flex items-center gap-2 p-2 rounded-md transition-colors"
              onClick={handleLogout}
            >
              <IconLogout className="size-4" />
              <span>Cerrar sesion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
