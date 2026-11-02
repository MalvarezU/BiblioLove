# Plan: Rediseño de interfaz BiblioLove

## Contexto actual

- Next.js 16.3.4 (App Router, Turbopack), React 19, Prisma 7, Tailwind v4 (CSS-first, sin `tailwind.config`).
- shadcn ya instalado en estilo **base-vega** (sobre Base UI, no Radix), con 25 componentes en `components/ui/` (button, card, table, dialog, sidebar, etc.), iconos **Tabler**, paleta de tokens oklch en `app/globals.css` (baseColor mauve con primary azul).
- Los estilos actuales ignoran los tokens: clases hardcodeadas `slate-*`, glassmorphism (`backdrop-blur`), gradientes azul/índigo, orbes de blur, `font-mono`, y un indicador "Supabase" pulsante en el header.
- `next-themes` 0.4.6 está instalado pero no se usa; el tema oscuro está forzado con `className="dark"` en `<html>` (app/layout.tsx:13).
- No existe landing: `/` (app/page.tsx) redirige a `/login` o `/home`.
- Modelo Prisma: `User` (ADMIN/USER), `Maestro` (título con `saldo` = unidades), `Movimiento` (ENTRADA/SALIDA). Reservas: **no implementar**.

## Objetivos

1. Paleta cálida estilo otoño (pasteles, naranjas/ocres, terracota suave; sin rojos intensos).
2. Tema claro + oscuro; default = preferencia del sistema (`next-themes`); botón de cambio de tema en landing y en el dashboard.
3. Eliminar glassmorphism excesivo, animaciones innecesarias e info irrelevante (indicador Supabase, ventana de código "bibliolove.config.ts", orbes de blur, cuadrículas decorativas).
4. Uso consistente de componentes shadcn estándar y tokens del tema (sin `bg-slate-900/70 backdrop-blur`).
5. Nueva landing pública con un "recorrido por estanterías" donde cada estante describe un género literario, con colores de género armonizados con la paleta.

---

## 1. Sistema de temas (paleta otoñal)

### `app/globals.css`
- Redefinir tokens `:root` (claro) y `.dark` en oklch con matiz cálido (~hsl 30–70):
  - **Claro**: fondo papel crema (`oklch(0.97 0.01 85)` aprox.), foreground marrón oscuro cálido, card blanco roto cálido, primary naranja calabaza/ámbar (`oklch(0.65 0.13 55)`), accent terracota suave, muted beige cálido, secondary gris cálido tenue. Borders beige. `--destructive` rojo apagado (solo errores).
  - **Oscuro**: fondo marrón-carbón cálido (no negro puro, `oklch(0.22 0.015 70)`), foreground crema, card marrón oscuro, primary ámbar más suave, accent terracota apagada, borders translúcidos cálidos.
  - Tokens de sidebar, ring y charts en la misma familia cálida.
  - Mantener la estructura actual de `@theme inline` y `@custom-variant dark`; solo cambiar valores.
- Añadir utilidades mínimas si se necesitan (nada de glass).

### Providers y layout raíz (`app/layout.tsx`)
- Montar `<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionTheme>` de `next-themes` (ya instalado) en un cliente `components/theme-provider.tsx`.
- Quitar `dark` hardcodeado y `bg-slate-950` del body; usar clases token (`bg-background text-foreground`).
- `suppressHydrationWarning` en `<html>` (requerido por next-themes).
- Cargar fuentes con `next/font/google` (nueva, ya que `--font-sans` actualmente es undefined): **Fraunces** (display serif, aire librero) + **Source Sans 3** (texto). Exportar `--font-sans` y `--font-heading` en `@theme inline`.

### `components/theme-toggle.tsx` (nuevo)
- Botón `Button` (variante ghost) con `DropdownMenu` de shadcn: Claro / Oscuro / Sistema, iconos Tabler (`IconSun`, `IconMoon`, `IconDeviceDesktop`), marca la opción activa con `useTheme()` de next-themes.
- Se usará en: header del dashboard, nav de la landing y junto al formulario de login.

---

## 2. Landing pública

### Routing (decidido por el usuario)
- **Landing en `/`**: `app/page.tsx` muestra la landing si no hay cookie de sesión y redirige a `/home` si la hay. `/login` sigue existiendo y se enlaza desde la landing.
- Nueva ruta `app/(public)/` con layout propio (header simple: logo, toggle de tema, botón "Iniciar sesión") para landing y login; el grupo `(auth)` actual se integra ahí o se elimina.

### Diseño de la landing
- **Hero**: nombre BiblioLove (título con Fraunces), tagline cálido sobre la biblioteca, CTA "Iniciar sesión" (Button primary) y ancla "Recorrer las estanterías". Sin gradientes chillones: fondo crema/papel con acentos ocres sutiles.
- **Recorrido por estanterías** (sección principal):
  - Client component `components/landing/shelf-tour.tsx`: cada **estante** = un género; estantería de madera marrón cálido (bordes + repisa sólida) con **lomos de libros** (divs verticales de distinto alto/ancho/color) y, al enfocarse el estante, aparece el nombre del género + descripción.
  - Géneros (textos descriptivos cortos): Fantasía, Misterio y thriller, Ciencia, Historia, Romance, Infantil, Poesía, Ensayo.
  - Colores de lomos por género: paletas apagadas armonizadas con lo otoñal (oliva, mostaza, terracota, ciruela suave, azul pizarra cálido, arena, salvia, cacao) — contrastes bajos, nada estridente.
  - Animación: **solo la necesaria** — los lomos se deslizan/aparecen con `IntersectionObserver` (una transición CSS de ~500 ms cuando el estante entra en viewport, escalonada). Sin librerías de animación (no se instala framer-motion), sin loops infinitos.
  - Accesibilidad: respeta `prefers-reduced-motion`.
- **Sección final**: breve mensaje de bienvenida + CTA a login. Footer simple con nombre del proyecto.
- Sin mención a Supabase/stack técnico.

---

## 3. Rediseño del dashboard (estilo shadcn estándar, sin glass)

Regla global: usar tokens (`bg-card`, `border-border`, `text-muted-foreground`, `bg-primary`…) y componentes shadcn (`Card`, `Button`, `Badge`-con-classes mínimas, `Table`). Eliminar: `backdrop-blur*`, `bg-*-/[a]` sobre fondos, gradientes, orbes, `font-mono` decorativo, animaciones `ping`/`scale`.

- **`app/(main)/layout.tsx`**: header sólido (`bg-background border-b`), quitar pill "Supabase" animado, breadcrumb "BiblioLove / …" sin `font-mono`, añadir `ThemeToggle` a la derecha. Quitar `theme="dark"` hardcodeado del `Toaster` (usar `theme="system"` o quitar la prop).
- **`components/app-sidebar.tsx`** y **`nav-main.tsx`**: quitar clases slate/gradiente; logo en `bg-primary text-primary-foreground`; item activo con `bg-sidebar-accent` (shadcn estándar); renombrar "Maestros" → **"Libros"** en la navegación y textos visibles (el modelo Prisma no cambia). Actualizar `nav-user.tsx` si tiene colores hardcodeados.
- **`app/(main)/home/page.tsx`**: reescribir con `Card`/`CardHeader`/`CardContent` estándar; bienvenida + 3 tarjetas de métricas (títulos, unidades disponibles, usuarios) con iconos Tabler en fondos `bg-primary/10 text-primary` (tono ámbar), y lista "Últimos títulos registrados" sin blur ni gradientes.
- **`app/(main)/maestros/page.tsx`** + `components/maestros/tabla/index.tsx` + `components/maestros/dialog/index.tsx`: envolver tabla en `Card`, encabezado de página estándar, estados de stock (disponible / pocas unidades / agotado) con clases de color apagadas; toasts sin "Supabase".
- **`app/(main)/transacciones/page.tsx`**: `Card` como empty state con icono y texto del módulo pendiente (igual que ahora pero con tokens, sin clases slate).
- **`app/(main)/users/page.tsx`**, **`users/[id]/page.tsx`** y `components/users/*`: mismas reglas; el formulario `[id]` pasa a un `Card` con `Field`/`Input`/`Select` coherentes al tema y textos en español.
- **Login** (`app/(auth)/login/page.tsx` + `components/login-form.tsx`): eliminar orbes, cuadrícula, panel decorativo "Next.js + Supabase" y ventana de código; login en un `Card` estándar centrado con logo, campos, botón y accesos de prueba como `Button variant="outline"` pequeños; añadir `ThemeToggle` discreto.

---

## 4. Archivos a crear / modificar / limpiar

**Crear**
- `components/theme-provider.tsx`
- `components/theme-toggle.tsx`
- `components/landing/shelf-tour.tsx` (+ datos de géneros)
- `app/(public)/layout.tsx` y landing en `app/page.tsx` (o `app/(public)/…` según routing final)

**Modificar**
- `app/globals.css`, `app/layout.tsx`, `app/page.tsx`
- `app/(main)/layout.tsx`, `home/page.tsx`, `maestros/*`, `transacciones/page.tsx`, `users/*`, `login/*`
- `components/app-sidebar.tsx`, `nav-main.tsx`, `nav-user.tsx`, `login-form.tsx`, `maestros/*`, `users/*`

**Opcional / limpieza** (solo si no rompe nada): eliminar `components/team-switcher.tsx` y `components/nav-projects.tsx` (no se usan). No tocar APIs, Prisma ni lógica de sesión.

## 5. Verificación

- `npm run build` y lint del proyecto para confirmar que no hay errores de tipos ni hidratación.
- Revisión visual en dev: tema claro/oscuro (incl. preferencia del sistema), landing + animación de estanterías, login, dashboard, catálogo y usuarios.

## Decisiones confirmadas

- Landing pública en `/` (sin sesión) con redirección a `/home` con sesión.
- Terminología visual "Libros"/"Títulos" en lugar de "Maestros" (solo UI; modelo Prisma sin cambios).
- Animación de estanterías con scroll + IntersectionObserver (CSS puro + JS ligero, sin nuevas dependencias).

## Notas / fuera de alcance

- No se implementa reservas ni lógica de préstamos; solo rediseño de la UI existente.
- No se cambia esquema Prisma ni endpoints API.
