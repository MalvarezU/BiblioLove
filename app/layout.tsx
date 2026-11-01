import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BiblioLove - Sistema de Gestion de Biblioteca',
  description: 'Sistema de gestion de inventario y prestamos de biblioteca',
};

// Layout raiz de la aplicacion.
// Aplica clase dark y estilo de fondo oscuro confortable para la vista.
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className="h-full dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
