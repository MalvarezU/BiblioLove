# BiblioLove - Sistema de Gestion de Biblioteca

Proyecto evaluativo de Ingenieria Web desarrollado en Next.js (App Router), React, TailwindCSS y PostgreSQL en Supabase mediante Prisma ORM.

## Proposito del Proyecto

BiblioLove es un sistema de administracion de biblioteca que permite:
- **Autenticacion** de usuarios con roles diferenciados (ADMIN / USER).
- **Gestion de Libros**: catalogo de obras con categorias, generos, autores y ejemplares.
- **Gestion de Prestamos y Reservas**: control de checkouts, devoluciones, fechas de vencimiento y reservas.
- **Gestion de Usuarios**: administracion de cuentas y roles (solo ADMIN).

---

## Credenciales de Acceso

El sistema cuenta con usuarios precargados en la base de datos de Supabase:

| Rol | Correo Electronico | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@biblioteca.com` | `admin123` | Acceso total: Libros (crear y ver), Usuarios (administrar), Prestamos y reservas |
| **USER** | `lector@biblioteca.com` | `user123` | Acceso a Libros (solo ver) y Prestamos |

---

## Configuracion del Entorno de Desarrollo

### 1. Variables de Entorno

Crear el archivo `.env` en la raiz del proyecto con las credenciales de Supabase:

```env
# Connect to Postgres via the shared transaction-mode pooler (IPv4-only)
DATABASE_URL="postgresql://postgres.hqcjdwvysuuyuugfemwz:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Connect to Postgres via the shared session-mode pooler (used for migrations)
DIRECT_URL="postgresql://postgres.hqcjdwvysuuyuugfemwz:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

Un archivo de ejemplo esta disponible en `.env.example`.

### 2. Instalacion de Dependencias

```bash
npm install
```

### 3. Migraciones y Generacion del Cliente Prisma

```bash
# Aplicar migraciones pendientes a la base de datos
npx prisma migrate dev --config prisma7.config.ts

# Generar el cliente de Prisma
npx prisma generate --config prisma7.config.ts
```

### 4. Cargar Datos Iniciales (Seed)

```bash
npx tsx prisma/seed.ts
```

El seed crea usuarios de prueba, las categorias y generos base, autores, libros, ejemplares,
reservas y prestamos de ejemplo para que los dashboards tengan contenido desde el inicio.

### 5. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicacion estara disponible en [http://localhost:3000](http://localhost:3000).

---

## Estructura de Rutas y Modulos

- `/`: Landing publica con opcion para iniciar sesion.
- `/login`: Formulario de autenticacion.
- `/home`: Panel de control general con resumen estadistico.
- `/maestros`: Catalogo de libros, autores, categorias, generos y ejemplares.
- `/prestamos`: Historial de prestamos y devoluciones (admin ve todos, usuario ve los propios).
- `/reservas`: Historial de reservas (admin ve todas, usuario ve las propias).
- `/users`: Administracion de usuarios y roles (solo ADMIN).

---

## Modulo de Libros (detalle)

La pagina `/maestros` muestra el catalogo bibliografico.

### Funcionalidades

- Tabla: titulo, autor, categoria, genero y ejemplares disponibles.
- Buscador en tiempo real por titulo, autor, categoria o genero.
- Boton "Nuevo Libro" (solo ADMIN): registra una obra con categoria, genero, autor y su primer ejemplar.
- Boton de gestion de ejemplares (solo ADMIN): permite marcar ejemplares como deteriorados (enabled=false) o perdidos (enabled=false, deleted=true).
- USER puede ver el catalogo pero no crear libros.

### Endpoints

- `GET /api/books` — lista libros con autor, categoria, genero y ejemplares.
- `POST /api/books` — crea un libro y sus ejemplares iniciales.
- `GET /api/books/[id]` — detalle de un libro.
- `PATCH /api/books/[id]` — actualiza datos bibliograficos.

---

## Modulos de Prestamos y Reservas (detalle)

Las paginas `/prestamos` y `/reservas` muestran el historial de prestamos y reservas de la biblioteca. El administrador ve todos los registros; cada usuario ve unicamente los suyos.

### Funcionalidades

- Resumen de prestamos totales, activos, con retraso y entregados.
- Tabla de checkouts: libro, usuario, fecha de prestamo, vencimiento, devolucion y estado.
- Boton "Nuevo Prestamo" (solo ADMIN): selecciona un libro con ejemplares disponibles, un ejemplar y un usuario activo. El prestamo dura 30 dias.
- Listado de prestamos activos con boton "Recibir": registra la devolucion, marca el prestamo como Entregado o Entregado con retraso y devuelve el ejemplar a Disponible.
- Los usuarios con prestamos en retraso no pueden recibir nuevos prestamos.
- Boton "Nueva Reserva" (solo ADMIN): registra una reserva con fecha de reclamo al dia siguiente y fecha final 5 dias despues.
- Listado de reservas activas con boton "Reclamar": crea el prestamo de 30 dias y cambia la reserva al estado Reclamado.
- Las reservas activas vencidas se cancelan automaticamente al consultar el panel o mediante `/api/cron/reservations`.
- Un ejemplar reservado no puede reservarse para otro usuario.
- Los usuarios con prestamos en retraso no pueden realizar reservas ni reclamarlas.
- Tabla de reservas: libro, usuario, fecha de emision, fecha de reclamo, fecha final de reclamo y estado.

---

## Modulo de Usuarios (detalle)

La pagina `/users` (solo ADMIN) muestra la tabla de usuarios.

### Funcionalidades

- Tabla: usuario (nombre + id), correo, fecha de creacion, estado (activo/inactivo), rol.
- Boton "Editar rol" por usuario: dialogo con correo del usuario, dropdown de roles (ADMIN/USER) con el rol actual por defecto, cancelar y guardar (con loading y mensaje de exito/error; al tener exito cierra y actualiza la tabla).

---

## Identidad Visual (BibloLove)

El sistema visual sigue el manual de identidad BibloLove (ver rama `feat/identidad-visual`):

- **Paleta**: crema papel (fondo), tinta cafe (texto), borgona love (primario/acciones), dorado (rating/warning), chocolate nocturno (modo oscuro).
- **Tipografia**: Fraunces (titulos y numeros) + Inter (cuerpo), cargadas via `next/font`.
- **Radios**: 12px por defecto, pill en CTAs, 16px en dialogos.
- **Sombras**: con tinte borgona (no gris puro).
- **Iconos**: Lucide React.
- **Animaciones**: heartbeat (favoritos), float-soft (hero), transiciones 300ms.
- **Accesibilidad**: foco visible, contrastes WCAG AA verificados, targets tactiles >= 36px.
- **Regla 60-30-10**: 60% crema, 30% tinta/beige, 10% borgona.

El tema se define en `app/globals.css` (tokens CSS) y se aplica via Tailwind 4 (`@theme inline`).

---

## Arquitectura Tecnica

- **Framework**: Next.js 16 (App Router).
- **UI**: React 19, Tailwind CSS 4, shadcn/ui (New York).
- **ORM**: Prisma 7 con adapter PostgreSQL (`@prisma/adapter-pg`).
- **Base de datos**: PostgreSQL en Supabase.
- **Fuentes**: `next/font/google` (Fraunces, Inter).
- **Iconos**: `@tabler/icons-react`, `lucide-react`.
- **Notificaciones**: `sonner`.
- **Validacion de formularios**: `react-hook-form` + `zod`.

### Estructura de carpetas

```
app/
  (main)/          # Rutas autenticadas (home, maestros, prestamos, reservas, users)
  (public)/        # Rutas publicas (landing, login)
  api/             # API routes (login, books, user, users)
components/
  ui/              # Componentes shadcn/ui
  maestros/        # Dialogo y tabla de libros
  users/           # Dialogo y tabla de usuarios
  landing/         # Componentes de la landing
lib/
  prisma.ts        # Instancia de PrismaClient
  types.ts         # Tipos compartidos
  utils.ts         # Utilidades (cn)
prisma/
  schema.prisma    # Esquema de la base de datos
  seed.ts          # Datos iniciales
  migrations/      # Migraciones
```

---

## Integrantes del equipo

- Integrante 1
- Integrante 2
- Integrante 3

## Despliegue

- Vercel: https://nombreEquipoFuncionalidad.vercel.app

---

## Notas para el evaluador

- El proyecto se ejecuta con `npm run dev` tras configurar `.env` y correr el seed.
- La rama `feat/identidad-visual` contiene la nueva identidad visual (paleta BibloLove, fuentes, animaciones) y esta disponible para revision via PR.
- Las ramas de feature (`feat/transacciones-*`, `chore/*`) fueron integradas en `main` mediante fast-forward.
