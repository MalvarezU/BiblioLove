import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const users = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        lastName: true,
        password: false,
        id: true,
        enabled: true,
        role: true,
        deleted: true,
      },
    });
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 400 });
  }
}
