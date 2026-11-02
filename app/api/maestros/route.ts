import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/maestros - Retorna todos los maestros activos con el nombre de quien los creo
export async function GET(): Promise<NextResponse> {
  try {
    const maestros = await prisma.maestro.findMany({
      where: { deleted: false },
      select: {
        id: true,
        nombre: true,
        saldo: true,
        createdAt: true,
        creadoPor: {
          select: { name: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ maestros }, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo maestros:', error);
    return NextResponse.json({ error: 'Error al obtener maestros' }, { status: 500 });
  }
}

// POST /api/maestros - Crea un nuevo maestro con el saldo inicial dado.
// Si el saldo inicial es mayor a 0, registra un movimiento ENTRADA inicial para
// que el saldo quede trazado en el historial de movimientos.
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { nombre, saldo, userId } = await request.json();

    // Validacion basica de campos requeridos
    if (!nombre || saldo === undefined || !userId) {
      return NextResponse.json(
        { error: 'nombre, saldo y userId son requeridos' },
        { status: 400 }
      );
    }

    const saldoNum = Number(saldo);
    if (isNaN(saldoNum) || saldoNum < 0) {
      return NextResponse.json(
        { error: 'El saldo inicial no puede ser negativo' },
        { status: 400 }
      );
    }

    const maestro = await prisma.$transaction(async (tx) => {
      const creado = await tx.maestro.create({
        data: {
          nombre,
          saldo: saldoNum,
          userId,
        },
      });

      if (saldoNum > 0) {
        await tx.movimiento.create({
          data: {
            tipo: 'ENTRADA',
            cantidad: saldoNum,
            maestroId: creado.id,
            userId,
          },
        });
      }

      return creado;
    });

    return NextResponse.json({ maestro }, { status: 201 });
  } catch (error) {
    console.error('Error creando maestro:', error);
    return NextResponse.json({ error: 'Error al crear maestro' }, { status: 500 });
  }
}

