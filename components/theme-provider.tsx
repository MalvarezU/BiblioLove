'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

// Proveedor de tema con next-themes: usa la preferencia del sistema por defecto
// y aplica la clase .dark en <html> segun la seleccion del usuario.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
