# BiblioLove - Sistema de Gestion de Biblioteca

Proyecto evaluativo de Ingenieria Web desarrollado en Next.js (App Router), React, TailwindCSS y PostgreSQL en Supabase mediante Prisma ORM.

## Proposito del Proyecto

BiblioLove es un sistema de administracion de biblioteca que permite:
- **Autenticacion** de usuarios con roles diferenciados (ADMIN / USER).
- **Gestion de Maestros**: catalogo de libros/materiales con control de saldos de inventario.
- **Gestion de Transacciones**: registro de movimientos de inventario (entradas y salidas) con historial y grafica de evolucion de saldos.
- **Gestion de Usuarios**: administracion de cuentas y roles (solo ADMIN).

---

## Credenciales de Acceso

El sistema cuenta con usuarios precargados en la base de datos de Supabase:

| Rol | Correo Electronico | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@biblioteca.com` | `admin123` | Acceso total: Maestros (crear y ver), Usuarios (administrar), Transacciones |
| **USER** | `lector@biblioteca.com` | `user123` | Acceso a Maestros (solo ver) y Transacciones |

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

El seed crea 2 usuarios (admin y lector), 4 maestros de prueba y movimientos de inventario
de ejemplo para que la grafica y la tabla de Transacciones tengan contenido desde el inicio.

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
- `/maestros`: Catalogo de libros/materiales y control de saldos.
- `/transacciones`: Registro y visualizacion de movimientos de inventario.
- `/users`: Administracion de usuarios y roles (solo ADMIN).

---

## Modulo de Transacciones (detalle)

La pagina `/transacciones` permite visualizar y registrar movimientos de inventario por maestro.

### Funcionalidades

1. **Selector de Maestro**: dropdown para elegir el maestro a visualizar.
2. **Tabla de movimientos**: muestra id, fecha, tipo (ENTRADA/SALIDA), cantidad y persona que ejecuto el movimiento.
3. **Agregar movimiento**: dialogo con:
   - Titulo que muestra el maestro seleccionado.
   - Tipo de movimiento (entrada o salida).
   - Cantidad de unidades.
   - Saldo disponible del maestro (validacion preventiva).
   - Boton cancelar (cierra el dialogo).
   - Boton crear (registra el movimiento en la BD asociado al usuario en sesion, muestra loading y mensaje de exito/error; al tener exito cierra el dialogo y actualiza la tabla).
4. **Grafica de evolucion de saldos diarios**: SVG interactivo con area, tooltips al hover, leyenda (puntos, min, max, actual) y estado vacio con CTA.
5. **Resumen e innovacion**: 4 tarjetas (movimientos, entradas, salidas, neto) y filtro por tipo (Todos/Entrada/Salida) con contador.

### Reglas de negocio

- Tanto USER como ADMIN pueden acceder y crear movimientos.
- Una SALIDA no puede superar el saldo disponible (validado en backend y en el dialogo).
- Al crear un Maestro con saldo inicial > 0, se registra automaticamente un movimiento ENTRADA inicial para trazabilidad.
- El saldo del maestro se actualiza atomicamente (transaccion Prisma) al crear cada movimiento.

### Endpoints

- `GET /api/movimientos?maestroId=...` — lista movimientos de un maestro (ordenados por fecha desc).
- `POST /api/movimientos` — crea un movimiento y actualiza el saldo del maestro. Body: `{ maestroId, tipo, cantidad, userId }`.

---

## Modulo de Maestros (detalle)

La pagina `/maestros` muestra el catalogo de libros/materiales.

### Funcionalidades

- Tabla: id, nombre, saldo, creador.
- Buscador en tiempo real por nombre o creador.
- Boton "Agregar" (solo ADMIN): dialogo con nombre, saldo inicial, cancelar y crear (con loading y mensaje de exito/error; al tener exito cierra y actualiza la tabla).
- USER puede ver pero no crear.

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
  (main)/          # Rutas autenticadas (home, maestros, transacciones, users)
  (public)/        # Rutas publicas (landing, login)
  api/             # API routes (login, maestros, movimientos, users)
components/
  ui/              # Componentes shadcn/ui
  maestros/        # Dialogo y tabla de maestros
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
