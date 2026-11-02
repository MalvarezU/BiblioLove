import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  } else {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { user } = await request.json();

    if (!user || !user.email || !user.name) {
      return NextResponse.json(
        { error: 'Email y nombre son requeridos' },
        { status: 400 }
      );
    }

    const createUser = await prisma.user.create({
      data: {
        email: user.email.trim().toLowerCase(),
        name: user.name.trim(),
        lastName: user.lastName ? user.lastName.trim() : null,
        role: user.role || 'USER',
        password: user.password && user.password.trim() ? user.password.trim() : '123456',
      },
    });

    return NextResponse.json({ user: createUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 400 });
  }
}
