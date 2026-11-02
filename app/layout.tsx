import type { Metadata } from 'next';
import { Fraunces, Source_Sans_3 } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const sans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BiblioLove - Sistema de Gestion de Biblioteca',
  description: 'Sistema de gestion de inventario y prestamos de biblioteca',
};

// Layout raiz: carga las fuentes del proyecto y el proveedor de tema
// (claro/oscuro, con preferencia del sistema por defecto).
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
