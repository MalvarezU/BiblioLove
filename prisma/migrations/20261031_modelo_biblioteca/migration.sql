-- Migracion: modelo_biblioteca
-- Sistema de Gestion de Biblioteca BiblioLove
-- Agrega los modelos: Maestro y Movimiento junto con sus enumeraciones

-- Crear enum para el tipo de movimiento de inventario
CREATE TYPE "Enum_Movimiento_Tipo" AS ENUM ('ENTRADA', 'SALIDA');

-- Actualizar tabla User para agregar campos faltantes de la migracion inicial
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deleted"   BOOLEAN  NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "enabled"   BOOLEAN  NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role"      TEXT     NOT NULL DEFAULT 'USER';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName"  TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password"  TEXT;

-- Tabla de maestros: cada maestro es un tipo de libro o material de la biblioteca
CREATE TABLE "Maestro" (
    "id"        TEXT      NOT NULL,
    "nombre"    TEXT      NOT NULL,
    "saldo"     DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deleted"   BOOLEAN   NOT NULL DEFAULT false,
    "enabled"   BOOLEAN   NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId"    TEXT      NOT NULL,

    CONSTRAINT "Maestro_pkey" PRIMARY KEY ("id")
);

-- Tabla de movimientos: cada fila registra una entrada o salida de un maestro
CREATE TABLE "Movimiento" (
    "id"        TEXT      NOT NULL,
    "tipo"      "Enum_Movimiento_Tipo" NOT NULL,
    "cantidad"  DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "maestroId" TEXT      NOT NULL,
    "userId"    TEXT      NOT NULL,

    CONSTRAINT "Movimiento_pkey" PRIMARY KEY ("id")
);

-- Claves foraneas: Maestro -> User (quien lo creo)
ALTER TABLE "Maestro" ADD CONSTRAINT "Maestro_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Claves foraneas: Movimiento -> Maestro
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_maestroId_fkey"
    FOREIGN KEY ("maestroId") REFERENCES "Maestro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Claves foraneas: Movimiento -> User (quien ejecuto el movimiento)
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

