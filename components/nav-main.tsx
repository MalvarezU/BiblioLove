'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';

type NavItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  adminOnly?: boolean;
  items?: { title: string; url: string }[];
};

type Props = {
  items: NavItem[];
};

// NavMain renderiza los links principales de navegacion.
// Aplica estilos modernos estilo programador con acentos en azul e indicadores activos.
export function NavMain({ items }: Props) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('session_user');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        setRole(user.role ?? null);
      } catch {
        // Ignora errores si el formato en localStorage no es JSON valido
      }
    }
  }, []);

  const itemsVisibles = items.filter((item) => {
    if (item.adminOnly && role !== 'ADMIN') return false;
    return true;
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-slate-500 text-[11px] font-semibold tracking-wider uppercase px-2 mb-2">
        Plataforma
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {itemsVisibles.map((item) => {
          const activo =
            pathname === item.url || (item.url !== '/home' && pathname.startsWith(item.url));

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={activo}
                render={<Link href={item.url} />}
                className={
                  activo
                    ? 'bg-gradient-to-r from-blue-600/20 to-blue-500/5 text-blue-400 border border-blue-500/30 font-medium shadow-sm shadow-blue-950/50'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors'
                }
              >
                {item.icon}
                <span className="text-sm">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
