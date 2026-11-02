import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
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
      className={`${inter.variable} ${fraunces.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
