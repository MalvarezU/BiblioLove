'use client';

import * as React from 'react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  IconBook2,
  IconUsers,
  IconArrowsExchange,
  IconDashboard,
} from '@tabler/icons-react';

const navItems = [
  {
    title: 'Dashboard',
    url: '/home',
    icon: <IconDashboard className="size-4" />,
    items: [],
  },
  {
    title: 'Libros',
    url: '/maestros',
    icon: <IconBook2 className="size-4" />,
    items: [],
  },
  {
    title: 'Prestamos',
    url: '/transacciones',
    icon: <IconArrowsExchange className="size-4" />,
    items: [],
  },
  {
    title: 'Usuarios',
    url: '/users',
    icon: <IconUsers className="size-4" />,
    adminOnly: true,
    items: [],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border p-4 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground group-data-[collapsible=icon]:size-8">
            <IconBook2 className="size-5 group-data-[collapsible=icon]:size-4" />
          </div>
          <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-heading text-sm font-semibold tracking-tight">
              BiblioLove
            </span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              Sistema Bibliotecario
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 group-data-[collapsible=icon]:px-0">
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
