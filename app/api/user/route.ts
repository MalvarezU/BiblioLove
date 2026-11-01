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
  const { user } = await request.json();
  try {
    const createUser = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        role: user.role,
        password: '123',
      },
    });
    return NextResponse.json({ user: createUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating user', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 401 });
  }
}
