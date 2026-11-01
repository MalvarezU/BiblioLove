import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

// Cadena de conexion a la base de datos de Supabase
const connectionString = `${process.env.DATABASE_URL}`;

// Instancia de conexion utilizando el adapter de PostgreSQL para Prisma 7
const adapter = new PrismaPg(
  { connectionString },
  {
    // Schema public de Supabase donde se ejecutaron las migraciones
    schema: 'public',
  }
);

// Mantiene una sola instancia de PrismaClient en desarrollo para evitar agotar conexiones
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
