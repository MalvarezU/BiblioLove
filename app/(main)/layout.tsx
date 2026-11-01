import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { IconDatabase } from '@tabler/icons-react';

// Layout principal para todas las paginas autenticadas.
// Proporciona el sidebar, barra de estado superior con diseno translucido y contenedor de contenido.
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-slate-950 text-slate-100 min-h-screen flex flex-col">
        {/* Barra superior con efecto glassmorphism y estado de conexion */}
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-950/70 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors" />
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-4 bg-slate-800"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono tracking-wider text-slate-400">
                BiblioLove
              </span>
              <span className="text-slate-600 text-xs">/</span>
              <span className="text-xs font-medium text-slate-300">
                Gestion de Biblioteca
              </span>
            </div>
          </div>

          {/* Indicador de estado del sistema */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-slate-400 hidden sm:inline">Supabase</span>
              <IconDatabase className="size-3.5 text-blue-400" />
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
          <Toaster richColors position="top-right" theme="dark" />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
