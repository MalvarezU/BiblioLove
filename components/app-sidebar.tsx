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
    title: 'Maestros',
    url: '/maestros',
    icon: <IconBook2 className="size-4" />,
    items: [],
  },
  {
    title: 'Transacciones',
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
    <Sidebar
      collapsible="icon"
      className="bg-slate-950 border-r border-slate-800/80"
      {...props}
    >
      <SidebarHeader className="border-b border-slate-800/80 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-900/30">
            <IconBook2 className="size-5 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-100 text-sm tracking-tight">
                BiblioLove
              </span>
              <span className="rounded bg-blue-500/10 px-1 py-0.2 text-[10px] font-mono font-medium text-blue-400 border border-blue-500/20">
                v1.0
              </span>
            </div>
            <span className="text-slate-500 text-xs">Sistema Bibliotecario</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-800/80 p-2">
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
