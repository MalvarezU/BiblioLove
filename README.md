# BiblioLove - Sistema de Gestion de Biblioteca

Proyecto evaluativo de Ingenieria Web desarrollado en Next.js (App Router), React, TailwindCSS y PostgreSQL en Supabase mediante Prisma ORM.

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

### 5. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicacion estara disponible en [http://localhost:3000](http://localhost:3000).

---

## Estructura de Rutas y Modulos

- `/login`: Formulario de autenticacion de usuarios.
- `/home`: Panel de control general con resumen estadistico.
- `/maestros`: Gestion del catalogo de libros y saldos de inventario 
- `/transacciones`: Registro de prestamos y devoluciones 
- `/users`: Administracion de usuarios y asignacion de roles
