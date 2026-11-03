import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Devuelve el usuario de la sesion actual (o null si no hay sesion valida).
export async function getSessionUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_user_id')?.value;
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId, deleted: false },
    select: { id: true, name: true, lastName: true, email: true, role: true },
  });
}
