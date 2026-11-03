import { NextResponse } from 'next/server';
import { expirarReservasVencidas } from '@/lib/reservations';

export const dynamic = 'force-dynamic';

// GET /api/cron/reservations - Cancela reservas activas vencidas.
// Puede invocarse periodicamente desde un cron o programador externo.
export async function GET(): Promise<NextResponse> {
  try {
    const result = await expirarReservasVencidas();
    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (error) {
    console.error('Error expirando reservas:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al expirar reservas' },
      { status: 500 }
    );
  }
}
