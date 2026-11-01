// Configuracion de Prisma para el proyecto BiblioLove.
// En Prisma 7+, las URLs de conexion se definen aqui, no en el schema.
// DATABASE_URL usa el pooler de transacciones (para queries normales).
// DIRECT_URL usa el pooler de sesion (requerido para migraciones).
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // DIRECT_URL se usa para migraciones porque requiere una sesion completa
    url: process.env['DIRECT_URL'],
  },
});
