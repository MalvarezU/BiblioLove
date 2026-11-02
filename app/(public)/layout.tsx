import { PublicHeader } from '@/components/public-header';

// Layout de las paginas publicas (landing y login): header con la identidad
// de la marca, navegacion, cambio de tema y acceso al inicio de sesion.
export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-svh flex-col">
      <PublicHeader />

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-1 px-6 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <span className="font-medium text-foreground">BiblioLove</span>
          <span>Sistema de gestion de biblioteca</span>
        </div>
      </footer>
    </div>
  );
}
