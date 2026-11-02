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
// El item activo usa el estilo por defecto del sidebar (tokens del tema).
export function NavMain({ items }: Props) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const raw = localStorage.getItem('session_user');
      if (raw) {
        try {
          const user = JSON.parse(raw);
          setRole(user.role ?? null);
        } catch {
          // Ignora errores si el formato en localStorage no es JSON valido
        }
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const itemsVisibles = items.filter((item) => {
    if (item.adminOnly && role !== 'ADMIN') return false;
    return true;
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
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
                className="group-data-[collapsible=icon]:justify-center"
              >
                {item.icon}
                <span className="group-data-[collapsible=icon]:hidden">
                  {item.title}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
