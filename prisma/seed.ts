import { prisma } from '../lib/prisma';

// Script para insertar usuarios iniciales y datos de prueba en la base de datos de Supabase.
// Permite que el sistema tenga un administrador, un usuario estandar y maestros de prueba.
async function main() {
  console.log('Iniciando carga de datos iniciales (seed)...');

  // 1. Crear o verificar usuario Administrador
  const admin = await prisma.user.upsert({
    where: { email: 'admin@biblioteca.com' },
    update: {
      role: 'ADMIN',
      enabled: true,
      deleted: false,
    },
    create: {
      email: 'admin@biblioteca.com',
      name: 'Admin',
      lastName: 'BiblioLove',
      password: 'admin123',
      role: 'ADMIN',
      enabled: true,
      deleted: false,
    },
  });
  console.log('Usuario administrador listo:', admin.email);

  // 2. Crear o verificar usuario Estandar (USER)
  const regularUser = await prisma.user.upsert({
    where: { email: 'lector@biblioteca.com' },
    update: {
      role: 'USER',
      enabled: true,
      deleted: false,
    },
    create: {
      email: 'lector@biblioteca.com',
      name: 'Lector',
      lastName: 'BiblioLove',
      password: 'user123',
      role: 'USER',
      enabled: true,
      deleted: false,
    },
  });
  console.log('Usuario estandar listo:', regularUser.email);

  // 3. Crear maestros de prueba si la tabla esta vacia
  const countMaestros = await prisma.maestro.count();
  if (countMaestros === 0) {
    await prisma.maestro.createMany({
      data: [
        {
          nombre: 'Cien Anos de Soledad - Gabriel Garcia Marquez',
          saldo: 15,
          userId: admin.id,
        },
        {
          nombre: 'Clean Code - Robert C. Martin',
          saldo: 8,
          userId: admin.id,
        },
        {
          nombre: 'Estructuras de Datos y Algoritmos en Java',
          saldo: 12,
          userId: admin.id,
        },
        {
          nombre: 'El Principito - Antoine de Saint-Exupery',
          saldo: 20,
          userId: admin.id,
        },
      ],
    });
    console.log('Maestros de prueba creados.');
  } else {
    console.log(`Ya existen ${countMaestros} maestros en la base de datos.`);
  }

  console.log('Seed completado con exito.');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

