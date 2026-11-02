import { AppSidebar } from '@/components/app-sidebar';
import { LogoutButton } from '@/components/logout-button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';

// Layout principal para todas las paginas autenticadas.
// Proporciona el sidebar, barra superior y contenedor de contenido.
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Biblio<span className="italic text-primary">Love</span></span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">Gestion de Biblioteca</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LogoutButton variant="ghost" size="icon" />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-6 md:p-8">
          {children}
          <Toaster richColors position="top-right" />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
