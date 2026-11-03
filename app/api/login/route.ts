import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/login - Autentica al usuario y guarda su id en una cookie de sesion.
// La cookie dura 3 dias y es HttpOnly para protegerla de XSS.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email y password son requeridos' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, password: true, role: true, deleted: true, enabled: true },
    });

    // Usuario no existe, fue eliminado o esta deshabilitado
    if (!user || user.deleted) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }

    if (!user.enabled) {
      return NextResponse.json({ error: 'Usuario deshabilitado' }, { status: 403 });
    }

    // Comparacion directa (el proyecto usa password en texto plano segun el codigo base)
    if (user.password !== password) {
      return NextResponse.json({ error: 'Contrasena incorrecta' }, { status: 401 });
    }

    const tresDias = 3 * 24 * 60 * 60; // segundos

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Guarda el id del usuario en cookie HttpOnly para leerlo en Server Components
    response.cookies.set('session_user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tresDias,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE /api/login - Cierra la sesion eliminando la cookie
export async function DELETE(): Promise<NextResponse> {
  const response = NextResponse.json({ message: 'Sesion cerrada' }, { status: 200 });
  response.cookies.delete('session_user_id');
  return response;
}
