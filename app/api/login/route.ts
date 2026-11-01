import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const data = await request.json();
  if (data.password && data.email) {
    try {
      const validation = await prisma.user.findUnique({
        where: {
          email: data.email,
        },
        select: {
          password: true,
        },
      });
      if (validation) {
        if (validation.password === data.password) {
          const hoy = new Date();
          const fechaEnTresDias = new Date(hoy);
          fechaEnTresDias.setDate(hoy.getDate() + 3);
          return NextResponse.json(
            {
              user: {
                token: crypto.randomUUID(),
                vencimiento: fechaEnTresDias,
              },
            },
            { status: 201 }
          );
        } else {
          return NextResponse.json({ error: 'Password Incorrect' }, { status: 401 });
        }
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 401 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
